// Unsplash API calls (search + download tracking). Network only — picking is in domain/photoPick.
// Guidelines followed: photos are hotlinked from Unsplash's URLs, the download endpoint is
// called when a photo is used, and screens credit "Photo by <name> on Unsplash" with links.
import { type PickedPhoto, photoQuery, pickBest, toPickedPhoto, type UnsplashResult } from '../domain/photoPick';

const API = 'https://api.unsplash.com';

export type FetchLike = (url: string, init?: { headers?: Record<string, string> }) => Promise<{
  ok: boolean;
  status: number;
  headers: { get(name: string): string | null };
  json(): Promise<unknown>;
}>;

export interface SearchOutcome {
  photo: PickedPhoto | null;
  /** Requests left this hour, from Unsplash's X-Ratelimit-Remaining header (null if not sent). */
  remaining: number | null;
  /** True when Unsplash refused the request because the hourly limit is used up. */
  rateLimited: boolean;
}

export function unsplashKey(): string | undefined {
  const key = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY;
  return key && key.trim() ? key.trim() : undefined;
}

function headers(key: string): Record<string, string> {
  return { 'Accept-Version': 'v1', Authorization: `Client-ID ${key}` };
}

function remainingOf(res: { headers: { get(name: string): string | null } }): number | null {
  const v = res.headers.get('x-ratelimit-remaining');
  return v === null ? null : Number(v);
}

/** Search Unsplash for a dish and auto-pick the best matching photo (or none). */
export async function searchDishPhoto(name: string, key: string, fetchImpl: FetchLike = fetch as unknown as FetchLike, rejected: string[] = []): Promise<SearchOutcome> {
  const url = `${API}/search/photos?per_page=10&content_filter=high&query=${encodeURIComponent(photoQuery(name))}`;
  const res = await fetchImpl(url, { headers: headers(key) });
  const remaining = remainingOf(res);
  if (res.status === 403 || res.status === 429) return { photo: null, remaining: 0, rateLimited: true };
  if (!res.ok) throw new Error(`Unsplash search failed (${res.status})`);
  const body = (await res.json()) as { results?: UnsplashResult[] };
  const best = pickBest(body.results ?? [], name, rejected);
  return { photo: best ? toPickedPhoto(best) : null, remaining, rateLimited: false };
}

/** Tell Unsplash a photo is being used (required by its API guidelines). */
export async function trackDownload(downloadLocation: string, key: string, fetchImpl: FetchLike = fetch as unknown as FetchLike): Promise<number | null> {
  const res = await fetchImpl(downloadLocation, { headers: headers(key) });
  return remainingOf(res);
}
