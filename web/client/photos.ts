// Dish-photo filling on the web. The shared filler (src/lib/photoFiller.ts) runs unchanged,
// but its Unsplash calls go through this app's server (/api/unsplash/*), which adds the
// access key, so the key never reaches the browser.
import type { Db } from '../shared/src/db/db';
import { type FillOptions, fillMissingPhotos } from '../shared/src/lib/photoFiller';
import { proxyFetch } from './unsplashProxy';

/** The key is held by the server; the filler only needs a non-empty placeholder. */
export const SERVER_HELD_KEY = 'server';

export function fillPhotos(db: Db, opts: FillOptions = {}) {
  return fillMissingPhotos(db, { ...opts, key: SERVER_HELD_KEY, fetchImpl: proxyFetch });
}
