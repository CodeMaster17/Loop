// Fills in missing dish photos a few at a time, staying well under Unsplash's
// 50-requests-per-hour demo limit (each dish costs a search + a download ping).
// Runs in the background after the app opens; screens refresh when it saves photos.
import type { Db } from '../db/db';
import { dishesNeedingPhoto, setDishPhoto } from '../db/repo';
import { hasBundledPhoto } from './dishImage';
import { type FetchLike, searchDishPhoto, trackDownload, unsplashKey } from './unsplash';

export interface FillResult {
  checked: number;
  found: number;
  stoppedForLimit: boolean;
}

export interface FillOptions {
  key?: string;
  /** Most dishes to look up in one run. */
  maxDishes?: number;
  /** Stop when Unsplash says this many (or fewer) requests are left this hour. */
  keepInReserve?: number;
  /** Pause between dishes, in ms. */
  pauseMs?: number;
  fetchImpl?: FetchLike;
  now?: () => Date;
  /** Skip dishes that already have a photo bundled in the app (default false: Unsplash is preferred). */
  skipBundled?: boolean;
}

type Listener = () => void;
const listeners = new Set<Listener>();

/** Tell screens to reload photos (e.g. after one was rejected). */
export function notifyPhotosUpdated(): void {
  listeners.forEach((fn) => fn());
}

/** Subscribe to "new photos were saved". Returns an unsubscribe function. */
export function onPhotosUpdated(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

let running = false;

export async function fillMissingPhotos(db: Db, opts: FillOptions = {}): Promise<FillResult> {
  const key = opts.key ?? unsplashKey();
  const result: FillResult = { checked: 0, found: 0, stoppedForLimit: false };
  if (!key || running) return result;
  running = true;
  const reserve = opts.keepInReserve ?? 6;
  const pause = opts.pauseMs ?? 1200;
  const now = opts.now ?? (() => new Date());
  try {
    const all = await dishesNeedingPhoto(db, 500, 7, now());
    const skip = opts.skipBundled ?? false;
    const todo = all.filter((d) => !skip || !hasBundledPhoto(d.name)).slice(0, opts.maxDishes ?? 20);
    for (const dish of todo) {
      const outcome = await searchDishPhoto(dish.name, key, opts.fetchImpl, dish.rejected);
      if (outcome.rateLimited) { result.stoppedForLimit = true; break; }
      result.checked += 1;
      if (outcome.photo) {
        await trackDownload(outcome.photo.downloadLocation, key, opts.fetchImpl);
        const { downloadLocation: _drop, ...photo } = outcome.photo;
        await setDishPhoto(db, dish.id, { ...photo, source: 'unsplash' }, now());
        result.found += 1;
        listeners.forEach((fn) => fn());
      } else {
        await setDishPhoto(db, dish.id, null, now());
      }
      // Each found photo costs 2 requests; stop before running Unsplash's budget down.
      if (outcome.remaining !== null && outcome.remaining - 1 <= reserve) { result.stoppedForLimit = true; break; }
      if (pause > 0) await new Promise((r) => setTimeout(r, pause));
    }
  } finally {
    running = false;
  }
  return result;
}
