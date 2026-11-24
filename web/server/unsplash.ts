// Server side of the Unsplash proxy. The browser calls /api/unsplash/*; these add the
// access key (UNSPLASH_ACCESS_KEY, server-only) and pass back Unsplash's status and
// rate-limit header, so the shared photo filler's hourly-limit handling works unchanged.
const API = 'https://api.unsplash.com';

export function accessKey(): string | null {
  // EXPO_PUBLIC_… is the native app's name for the same key (read from ../.env.local in local dev).
  const k = process.env.UNSPLASH_ACCESS_KEY ?? process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY;
  return k && k.trim() ? k.trim() : null;
}

/** Only search queries the app makes are passed on. */
export function searchUrl(search: URLSearchParams): string | null {
  const query = search.get('query');
  if (!query || query.length > 100) return null;
  const out = new URLSearchParams({ per_page: '10', content_filter: 'high', query });
  return `${API}/search/photos?${out.toString()}`;
}

/** Download-tracking pings must go to Unsplash's own photo download endpoint. */
export function downloadUrl(raw: string | null): string | null {
  if (!raw) return null;
  let u: URL;
  try { u = new URL(raw); } catch { return null; }
  if (u.protocol !== 'https:' || u.host !== 'api.unsplash.com' || !/^\/photos\/[A-Za-z0-9_-]+\/download$/.test(u.pathname)) return null;
  return u.toString();
}

/** Same-site requests only: the proxy is for Rasoi's own pages, not a public Unsplash mirror. */
export function fromOwnSite(req: Request): boolean {
  const site = req.headers.get('sec-fetch-site');
  return site === null || site === 'same-origin';
}

export async function forward(url: string, key: string): Promise<Response> {
  const res = await fetch(url, { headers: { 'Accept-Version': 'v1', Authorization: `Client-ID ${key}` }, cache: 'no-store' });
  const headers = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  const remaining = res.headers.get('x-ratelimit-remaining');
  if (remaining !== null) headers.set('X-Ratelimit-Remaining', remaining);
  return new Response(await res.text(), { status: res.status, headers });
}
