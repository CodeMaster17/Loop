// Unsplash goes through the server: the browser rewrites URLs, the server checks them.
import { describe, expect, it } from 'vitest';
import { proxyUrl } from '../client/unsplashProxy';
import { downloadUrl, fromOwnSite, searchUrl } from '../server/unsplash';

describe('browser side', () => {
  it('sends searches to /api/unsplash/search', () => {
    expect(proxyUrl('https://api.unsplash.com/search/photos?per_page=10&content_filter=high&query=poha'))
      .toBe('/api/unsplash/search?per_page=10&content_filter=high&query=poha');
  });

  it('sends download pings to /api/unsplash/download', () => {
    const ping = 'https://api.unsplash.com/photos/abc123/download?ixid=xyz';
    expect(proxyUrl(ping)).toBe(`/api/unsplash/download?url=${encodeURIComponent(ping)}`);
  });

  it('refuses anything that is not the Unsplash API', () => {
    expect(() => proxyUrl('https://example.com/x')).toThrow();
  });
});

describe('server side', () => {
  it('rebuilds the search with fixed options', () => {
    expect(searchUrl(new URLSearchParams({ query: 'rajma chawal', per_page: '30' })))
      .toBe('https://api.unsplash.com/search/photos?per_page=10&content_filter=high&query=rajma+chawal');
    expect(searchUrl(new URLSearchParams())).toBeNull();
  });

  it('only forwards Unsplash download endpoints', () => {
    expect(downloadUrl('https://api.unsplash.com/photos/abc_1-2/download?ixid=1')).toBe('https://api.unsplash.com/photos/abc_1-2/download?ixid=1');
    expect(downloadUrl('https://api.unsplash.com/me')).toBeNull();
    expect(downloadUrl('https://evil.example/photos/a/download')).toBeNull();
    expect(downloadUrl('http://api.unsplash.com/photos/a/download')).toBeNull();
    expect(downloadUrl('not a url')).toBeNull();
  });

  it('accepts same-origin browser requests only', () => {
    expect(fromOwnSite(new Request('https://x.test/api', { headers: { 'sec-fetch-site': 'same-origin' } }))).toBe(true);
    expect(fromOwnSite(new Request('https://x.test/api', { headers: { 'sec-fetch-site': 'cross-site' } }))).toBe(false);
  });
});

describe('shared photo filler through the proxy', () => {
  it('keeps the hourly-limit handling: a 403 from the server stops the run', async () => {
    const { searchDishPhoto } = await import('../shared/src/lib/unsplash');
    const seen: string[] = [];
    const fakeFetch = async (url: string) => {
      seen.push(proxyUrl(url));
      return { ok: false, status: 403, headers: { get: () => '0' }, json: async () => ({}) };
    };
    const out = await searchDishPhoto('Poha', 'server', fakeFetch);
    expect(out).toEqual({ photo: null, remaining: 0, rateLimited: true });
    expect(seen[0]).toMatch(/^\/api\/unsplash\/search\?/);
  });
});
