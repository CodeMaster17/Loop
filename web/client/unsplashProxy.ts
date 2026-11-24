// Browser side of the Unsplash proxy: Unsplash API URLs become this server's routes,
// which add the access key (see server/unsplash.ts).
import type { FetchLike } from '../shared/src/lib/unsplash';

const UNSPLASH_API = 'https://api.unsplash.com/';

/** Rewrites Unsplash API URLs to the server's proxy routes. */
export function proxyUrl(url: string): string {
  if (!url.startsWith(UNSPLASH_API)) throw new Error(`Not an Unsplash API URL: ${url}`);
  const u = new URL(url);
  if (u.pathname === '/search/photos') return `/api/unsplash/search${u.search}`;
  return `/api/unsplash/download?url=${encodeURIComponent(url)}`;
}

export const proxyFetch: FetchLike = (url) => fetch(proxyUrl(url)) as ReturnType<FetchLike>;
