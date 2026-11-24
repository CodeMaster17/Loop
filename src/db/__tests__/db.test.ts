/**
 * @jest-environment node
 */
import { openTestDb } from '../../../test/nodeDb';
import { MIGRATIONS, migrate } from '../migrations';
import {
  bitsFromSlots, dishesNeedingPhoto, getCook, getSettings, listDishes, listIngredients, rejectDishPhoto, saveCook,
  slotsFromBits, summary, updateSettings,
} from '../repo';
import { collectSeedDishes, seedIfEmpty } from '../seed';

async function fresh() {
  const db = openTestDb();
  await migrate(db);
  return db;
}

describe('migrations', () => {
  it('runs every migration and records the version', async () => {
    const db = openTestDb();
    expect(await migrate(db)).toBe(MIGRATIONS.length);
    const v = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    expect(v?.user_version).toBe(MIGRATIONS.length);
  });

  it('is a no-op when run again', async () => {
    const db = await fresh();
    expect(await migrate(db)).toBe(MIGRATIONS.length);
    const cooks = await db.getAllAsync('SELECT * FROM cook');
    expect(cooks).toHaveLength(1);
  });

  it('creates default schedules with grocery on Friday', async () => {
    const db = await fresh();
    const rows = await db.getAllAsync<{ kind: string; time_hhmm: string; weekday: number | null }>('SELECT kind, time_hhmm, weekday FROM schedules ORDER BY kind');
    expect(rows.map((r) => r.kind)).toEqual(['dinner_today', 'grocery', 'next_day', 'soak']);
    expect(rows.find((r) => r.kind === 'grocery')?.weekday).toBe(5);
  });

  it('enforces the bulk/weekly check', async () => {
    const db = await fresh();
    await expect(db.runAsync("INSERT INTO ingredients (key, name, buy_mode) VALUES ('x', 'X', 'monthly')")).rejects.toThrow();
  });
});

describe('seed', () => {
  it('seeds every library dish once, with ingredients and pantry rows', async () => {
    const db = await fresh();
    expect(await seedIfEmpty(db)).toBe(true);
    const s = await summary(db);
    expect(s.dishes).toBe(collectSeedDishes().length);
    expect(s.activeDishes).toBe(0); // nothing is ADDED until you choose
    expect(s.bulkIngredients).toBeGreaterThan(10);
    expect(s.weeklyIngredients).toBeGreaterThan(10);
    const orphans = await db.getFirstAsync<{ n: number }>(
      'SELECT COUNT(*) AS n FROM ingredients i LEFT JOIN pantry p ON p.ingredient_id = i.id WHERE p.ingredient_id IS NULL',
    );
    expect(orphans?.n).toBe(0);
  });

  it('does nothing the second time', async () => {
    const db = await fresh();
    await seedIfEmpty(db);
    const before = await summary(db);
    expect(await seedIfEmpty(db)).toBe(false);
    expect(await summary(db)).toEqual(before);
  });

  it('flags whole legumes for soaking but not split dals', async () => {
    const db = await fresh();
    await seedIfEmpty(db);
    const dishes = await listDishes(db);
    const rajma = dishes.find((d) => d.name.startsWith('Rajma Chawal'));
    const chanaDal = dishes.find((d) => d.name === 'Chana Dal + Rice');
    expect(rajma?.soak).toBe(true);
    expect(rajma?.soakNote).toBe('Soak rajma overnight');
    expect(chanaDal?.soak).toBe(false);
  });

  it('matches kitchen names to dish ingredients (Wheat Flour (Atta) = atta)', async () => {
    const db = await fresh();
    await seedIfEmpty(db);
    const atta = (await listIngredients(db)).filter((i) => i.key === 'atta');
    expect(atta).toHaveLength(1);
    expect(atta[0].name).toBe('Wheat Flour (Atta)');
    expect(atta[0].buyMode).toBe('bulk');
  });

  it('carries over onboarding choices, cook and protein target', async () => {
    const db = await fresh();
    await seedIfEmpty(db, {
      prefs: { menu: { breakfast: ['Poha with peanuts'], lunch: ['Chole + Rice'], snacks: [], dinner: [] }, pantry: { Salt: false, Rice: true } },
      settings: { cookName: 'Test Cook', cookNum: '910000000000', protein: 90, lang: 'hinglish' },
    });
    const active = await listDishes(db, { activeOnly: true });
    expect(active.map((d) => d.name).sort()).toEqual(['Chole + Rice', 'Poha with peanuts']);
    const ings = await listIngredients(db);
    expect(ings.find((i) => i.key === 'salt')?.level).toBe('out');
    expect(ings.find((i) => i.key === 'rice')?.level).toBe('ok');
    expect(ings.find((i) => i.key === 'tomato')?.level).toBeNull();
    expect(await getCook(db)).toEqual({ name: 'Test Cook', phone: '910000000000', language: 'hinglish' });
    expect((await getSettings(db)).proteinTargetG).toBe(90);
  });
});

describe('migration v3', () => {
  async function seededAtV2() {
    const db = openTestDb();
    await db.execAsync('PRAGMA foreign_keys = ON;');
    for (const [i, sql] of MIGRATIONS.slice(0, 2).entries()) {
      await db.execAsync(sql);
      await db.execAsync(`PRAGMA user_version = ${i + 1}`);
    }
    await seedIfEmpty(db);
    // Simulate a v2-era database where every dish was in rotation.
    await db.execAsync('UPDATE dishes SET active = 1');
    return db;
  }

  it('keeps fish dishes and the three snacks on the menu card but out of rotation', async () => {
    const db = await seededAtV2();
    const before = (await listDishes(db)).length;
    await migrate(db);
    const dishes = await listDishes(db);
    expect(dishes).toHaveLength(before);
    for (const name of ['Fish Curry + Rice', 'Machha Besara + Rice', 'Macha Jhola + Rice', 'Samosa (2)', 'Aloo Tikki', 'Mysore Bonda']) {
      expect(dishes.find((d) => d.name === name)?.active).toBe(false);
    }
    // v4 then resets every dish to "not added".
    expect(dishes.every((d) => !d.active)).toBe(true);
  });

  it("clears and blocks Rajma Chawal's first photo", async () => {
    const db = await seededAtV2();
    await db.runAsync("UPDATE dishes SET photo_id = 'bad1', photo_url = 'u', photo_thumb_url = 't', photo_author = 'a', photo_author_url = 'au', photo_page_url = 'p' WHERE name LIKE 'Rajma Chawal%'");
    await migrate(db);
    const rajma = (await listDishes(db)).find((d) => d.name.startsWith('Rajma Chawal'));
    expect(rajma?.photo).toBeNull();
    const todo = await dishesNeedingPhoto(db, 200);
    expect(todo.find((d) => d.name.startsWith('Rajma Chawal'))?.rejected).toEqual(['bad1']);
  });

  it('rejectDishPhoto remembers each rejected photo', async () => {
    const db = await seededAtV2();
    await migrate(db);
    const id = (await listDishes(db))[0].id;
    for (const pid of ['x1', 'x2']) {
      await db.runAsync("UPDATE dishes SET photo_id = ?, photo_url = 'u', photo_thumb_url = 't', photo_author = 'a', photo_author_url = 'au', photo_page_url = 'p' WHERE id = ?", pid, id);
      await rejectDishPhoto(db, id);
    }
    expect((await dishesNeedingPhoto(db, 500)).find((d) => d.id === id)?.rejected).toEqual(['x1', 'x2']);
  });
});

describe('repo round-trips', () => {
  it('reads default settings and saves a patch', async () => {
    const db = await fresh();
    expect(await getSettings(db)).toEqual({ proteinTargetG: 60, cookDays: [1, 2, 3, 4, 5, 6], cooldownDays: 7, servingsDefault: 1 });
    await updateSettings(db, { cookDays: [6, 1, 3], proteinTargetG: 120 });
    expect(await getSettings(db)).toMatchObject({ cookDays: [1, 3, 6], proteinTargetG: 120, cooldownDays: 7 });
  });

  it('saves the cook', async () => {
    const db = await fresh();
    await saveCook(db, { name: 'Cook', phone: '911111111111', language: 'hindi' });
    expect(await getCook(db)).toEqual({ name: 'Cook', phone: '911111111111', language: 'hindi' });
  });

  it('converts slot bitmasks both ways', () => {
    expect(slotsFromBits(5)).toEqual(['breakfast', 'dinner']);
    expect(bitsFromSlots(['lunch', 'dinner'])).toBe(6);
    expect(slotsFromBits(8)).toEqual([]); // snacks bit is stored but not planned
  });
});
