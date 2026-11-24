// Registers the service worker (public/sw.js) that makes Rasoi open offline, then hands
// it the files this page already loaded so they're cached from the very first visit.
/** `extra`: more same-site files to keep for offline use (e.g. every bundled photo). */
export function registerServiceWorker(extra: string[] = []): void {
  if (!('serviceWorker' in navigator) || process.env.NODE_ENV !== 'production') return;
  navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(async () => {
    const reg = await navigator.serviceWorker.ready;
    const urls = performance.getEntriesByType('resource')
      .map((e) => e.name)
      .filter((u) => u.startsWith(location.origin));
    reg.active?.postMessage({ type: 'cache-urls', urls: [location.origin + '/', ...urls, ...extra.map((u) => new URL(u, location.origin).href)] });
  }).catch((e: unknown) => console.error('[rasoi] service worker failed', e));
}
