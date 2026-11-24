/**
 * @jest-environment node
 */
import { openTestDb } from '../../../test/nodeDb';
import { migrate } from '../../db/migrations';
import { dishesNeedingPhoto, listDishes, photosByDishName } from '../../db/repo';
import { fillMissingPhotos, onPhotosUpdated } from '../photoFiller';
import type { FetchLike } from '../unsplash';

const NOW = new Date('2026-11-12T10:00:00Z');

async function dbWith(names: string[]) {
  const db = openTestDb();
  await migrate(db);
  for (const n of names) await db.runAsync('INSERT INTO dishes (name, slots, active) VALUES (?, 1, 1)', n);
  return db;
}

/** Fake Unsplash: search results per query text, and a remaining-requests counter. */
function fakeUnsplash(byQuery: Record<string, string[]>, startRemaining = 50) {
  let remaining = startRemaining;
  const calls: string[] = [];
  const fetchImpl: FetchLike = async (url) => {
    calls.push(url);
    remaining -= 1;
    const hdrs = { get: (h: string) => (h.toLowerCase() === 'x-ratelimit-remaining' ? String(remaining) : null) };
    if (url.includes('/download')) return { ok: true, status: 200, headers: hdrs, json: async () => ({}) };
    const q = decodeURIComponent(new URL(url).searchParams.get('query') ?? '');
    const alts = byQuery[q] ?? [];
    return {
      ok: true, status: 200, headers: hdrs,
      json: async () => ({
        results: alts.map((alt, i) => ({
          id: `${q}-${i}`, alt_description: alt, description: null,
          urls: { small: `https://img/${q}-${i}/small`, thumb: `https://img/${q}-${i}/thumb` },
          links: { html: `https://unsplash.com/photos/${q}-${i}`, download_location: `https://api.unsplash.com/photos/${q}-${i}/download` },
          user: { name: 'Photographer', links: { html: 'https://unsplash.com/@p' } },
        })),
      }),
    };
  };
  return { fetchImpl, calls, left: () => remaining };
}

describe('fillMissingPhotos', () => {
  it('saves matching photos, pings the download endpoint, and skips non-matches', async () => {
    const db = await dbWith(['Poha with peanuts', 'Moong Dal Chilla (2)']);
    const u = fakeUnsplash({
      'poha with peanuts': ['sliced bread', 'A metal plate of yellow poha with peanuts'],
      'moong dal cheela': ['a pile of corn'],
    });
    let updates = 0;
    const off = onPhotosUpdated(() => { updates += 1; });

    const r = await fillMissingPhotos(db, { key: 'k', pauseMs: 0, skipBundled: false, fetchImpl: u.fetchImpl, now: () => NOW });
    off();

    expect(r).toEqual({ checked: 2, found: 1, stoppedForLimit: false });
    expect(updates).toBe(1);
    expect(u.calls.filter((c) => c.includes('/download'))).toEqual(['https://api.unsplash.com/photos/poha with peanuts-1/download']);
    const photos = await photosByDishName(db);
    expect(photos['poha with peanuts'].url).toBe('https://img/poha with peanuts-1/small');
    expect(photos['poha with peanuts'].authorUrl).toContain('utm_source=rasoi');
    expect(Object.keys(photos)).toHaveLength(1);
  });

  it('does not search again for a dish checked recently, but retries after a week', async () => {
    const db = await dbWith(['Moong Dal Chilla (2)']);
    const u = fakeUnsplash({});
    await fillMissingPhotos(db, { key: 'k', pauseMs: 0, skipBundled: false, fetchImpl: u.fetchImpl, now: () => NOW });
    expect(await dishesNeedingPhoto(db, 10, 7, NOW)).toHaveLength(0);
    const eightDaysLater = new Date(NOW.getTime() + 8 * 86400000);
    expect(await dishesNeedingPhoto(db, 10, 7, eightDaysLater)).toHaveLength(1);
  });

  it('stops before using up the hourly limit', async () => {
    const db = await dbWith(['Poha with peanuts', 'Upma', 'Dal Tadka']);
    const u = fakeUnsplash({
      'poha with peanuts': ['poha with peanuts'],
      upma: ['a bowl of upma'],
      'dal tadka': ['yellow dal'],
    }, 9);
    const r = await fillMissingPhotos(db, { key: 'k', pauseMs: 0, skipBundled: false, keepInReserve: 6, fetchImpl: u.fetchImpl, now: () => NOW });
    expect(r.stoppedForLimit).toBe(true);
    expect(r.checked).toBeLessThan(3);
    expect(u.left()).toBeGreaterThanOrEqual(5);
  });

  it('stops cleanly when Unsplash says the limit is used up', async () => {
    const db = await dbWith(['Upma']);
    const fetchImpl: FetchLike = async () => ({ ok: false, status: 403, headers: { get: () => '0' }, json: async () => ({}) });
    const r = await fillMissingPhotos(db, { key: 'k', pauseMs: 0, skipBundled: false, fetchImpl, now: () => NOW });
    expect(r).toEqual({ checked: 0, found: 0, stoppedForLimit: true });
    expect(await dishesNeedingPhoto(db, 10, 7, NOW)).toHaveLength(1);
  });

  it('does nothing without a key', async () => {
    const db = await dbWith(['Upma']);
    const r = await fillMissingPhotos(db, { key: '', pauseMs: 0, now: () => NOW });
    expect(r.checked).toBe(0);
    expect((await listDishes(db))[0].photo).toBeNull();
  });
});

it('searches Unsplash even for dishes with a bundled photo, unless told to skip them', async () => {
  const fetchImpl: FetchLike = async () => ({ ok: true, status: 200, headers: { get: () => '40' }, json: async () => ({ results: [] }) });
  const db1 = await dbWith(['Poha with peanuts']);
  expect((await fillMissingPhotos(db1, { key: 'k', pauseMs: 0, fetchImpl, now: () => NOW })).checked).toBe(1);
  const db2 = await dbWith(['Poha with peanuts']);
  expect((await fillMissingPhotos(db2, { key: 'k', pauseMs: 0, skipBundled: true, fetchImpl, now: () => NOW })).checked).toBe(0);
});
