// The browser database: the native app's migrations and seed, run on sql.js.
import initSqlJs from 'sql.js';
import { beforeAll, describe, expect, it } from 'vitest';
import { migrate, MIGRATIONS } from '../shared/src/db/migrations';
import { listDishes, setDishActive } from '../shared/src/db/repo';
import { seedIfEmpty } from '../shared/src/db/seed';
import { wrapSqlJs } from '../client/db/sqljsDb';

let SQL: Awaited<ReturnType<typeof initSqlJs>>;
beforeAll(async () => { SQL = await initSqlJs(); });

async function freshDb() {
  let writes = 0;
  const db = wrapSqlJs(new SQL.Database(), () => { writes += 1; });
  return { db, writes: () => writes };
}

describe('sql.js Db', () => {
  it('runs every migration and seeds the menu card', async () => {
    const { db } = await freshDb();
    expect(await migrate(db)).toBe(MIGRATIONS.length);
    expect(await seedIfEmpty(db)).toBe(true);
    const dishes = await listDishes(db);
    expect(dishes.length).toBeGreaterThan(50);
    // v4: everything starts un-added.
    expect(dishes.every((d) => !d.active)).toBe(true);
  });

  it('starts onboarding picks as ADDED and keeps ADD changes', async () => {
    const { db } = await freshDb();
    await migrate(db);
    await seedIfEmpty(db, { prefs: { menu: { breakfast: ['Aloo Paratha + curd'], lunch: [], snacks: [], dinner: [] } } });
    const paratha = (await listDishes(db)).find((d) => d.name === 'Aloo Paratha + curd');
    expect(paratha?.active).toBe(true);
    await setDishActive(db, paratha!.id, false);
    expect((await listDishes(db, { activeOnly: true })).length).toBe(0);
  });

  it('survives a save and reload (export / import), keeping foreign keys on', async () => {
    const { db } = await freshDb();
    await migrate(db);
    await seedIfEmpty(db);
    const first = (await listDishes(db))[0];
    await setDishActive(db, first.id, true);
    const bytes = db.snapshot();
    const fk = await db.getFirstAsync<{ foreign_keys: number }>('PRAGMA foreign_keys');
    expect(fk?.foreign_keys).toBe(1);

    const reopened = wrapSqlJs(new SQL.Database(bytes));
    expect(await migrate(reopened)).toBe(MIGRATIONS.length);
    expect(await seedIfEmpty(reopened)).toBe(false);
    expect((await listDishes(reopened, { activeOnly: true })).map((d) => d.id)).toEqual([first.id]);
  });

  it('applies the v3 no-fish rule to an older database', async () => {
    const { db } = await freshDb();
    // Build a v2 database with a fish dish that was in the rotation.
    await db.execAsync('PRAGMA foreign_keys = ON;');
    for (const sql of MIGRATIONS.slice(0, 2)) await db.execAsync(sql);
    await db.execAsync('PRAGMA user_version = 2');
    await db.runAsync('INSERT INTO dishes (name, slots, veg, protein_g, active) VALUES (?, ?, ?, ?, ?)', 'Fish Curry + Rice', 2, 0, 30, 1);
    await db.runAsync('INSERT INTO dishes (name, slots, veg, protein_g, active) VALUES (?, ?, ?, ?, ?)', 'Dal Tadka', 2, 1, 18, 1);
    await migrate(db);
    const rows = await db.getAllAsync<{ name: string; active: number }>('SELECT name, active FROM dishes ORDER BY name');
    expect(rows).toEqual([{ name: 'Dal Tadka', active: 0 }, { name: 'Fish Curry + Rice', active: 0 }]);
  });

  it('rolls back a failed transaction and reports writes', async () => {
    const { db, writes } = await freshDb();
    await migrate(db);
    const before = writes();
    await expect(db.withTransactionAsync(async () => {
      await db.runAsync('UPDATE settings SET protein_target_g = 99 WHERE id = 1');
      throw new Error('boom');
    })).rejects.toThrow('boom');
    expect((await db.getFirstAsync<{ p: number }>('SELECT protein_target_g AS p FROM settings'))?.p).toBe(60);
    expect(writes()).toBeGreaterThan(before);
    expect(db.inTransaction()).toBe(false);
  });

  it('returns insert ids and change counts like expo-sqlite', async () => {
    const { db } = await freshDb();
    await migrate(db);
    const a = await db.runAsync('INSERT INTO ingredients (key, name, buy_mode) VALUES (?, ?, ?)', 'jeera', 'Jeera', 'bulk');
    const b = await db.runAsync('INSERT INTO ingredients (key, name, buy_mode) VALUES (?, ?, ?)', 'haldi', 'Haldi', 'bulk');
    expect(b.lastInsertRowId).toBe(a.lastInsertRowId + 1);
    const u = await db.runAsync("UPDATE ingredients SET deleted = 1 WHERE buy_mode = 'bulk'");
    expect(u.changes).toBe(2);
  });
});
