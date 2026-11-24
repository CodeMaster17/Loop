// First-run seed: the built-in dish library and kitchen items become the starting
// menu card and pantry. Choices from the old (AsyncStorage) onboarding carry over.
import { LIB } from '../data';
import { DISHES, KITCHEN } from '../data/cuisines';
import { defaultBuyMode, ingredientKey, soakIngredient, titleCase } from '../domain/ingredients';
import type { OnbSlot, Prefs, Settings } from '../types';
import type { Db } from './db';

export const SLOT_BIT: Record<OnbSlot, number> = { breakfast: 1, lunch: 2, dinner: 4, snacks: 8 };

/** What we can still use from the earlier AsyncStorage version of the app. */
export interface LegacyData {
  prefs?: Partial<Prefs>;
  settings?: Partial<Settings>;
}

interface SeedDish {
  name: string;
  slots: number;
  veg: boolean;
  protein: number;
  ingredients: string[];
}

/** Merge both libraries by name; a dish listed under two slots gets both bits. */
export function collectSeedDishes(): SeedDish[] {
  const byName = new Map<string, SeedDish>();
  const add = (name: string, slot: OnbSlot, veg: boolean, protein: number, ingredients: string[]) => {
    const k = name.trim().toLowerCase();
    const prev = byName.get(k);
    if (prev) {
      prev.slots |= SLOT_BIT[slot];
      return;
    }
    byName.set(k, { name: name.trim(), slots: SLOT_BIT[slot], veg, protein, ingredients });
  };
  DISHES.forEach((d) => add(d.name, d.slot, d.veg, d.p, d.i));
  LIB.forEach((d) => add(d.name, d.t, d.v, d.p, d.i));
  return [...byName.values()];
}

/** Seeds an empty database. Does nothing if any dish already exists. Returns true if it seeded. */
export async function seedIfEmpty(db: Db, legacy: LegacyData = {}): Promise<boolean> {
  const existing = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM dishes');
  if ((existing?.n ?? 0) > 0) return false;

  const dishes = collectSeedDishes();
  const chosen = new Set<string>();
  const menu = legacy.prefs?.menu;
  if (menu) Object.values(menu).forEach((names) => (names ?? []).forEach((n) => chosen.add(n.trim().toLowerCase())));
  const kitchenHave = legacy.prefs?.pantry ?? {};

  await db.withTransactionAsync(async () => {
    // Ingredients: kitchen items first (they carry nicer display names), then dish ingredients.
    const ingredientIds = new Map<string, number>();
    const upsertIngredient = async (raw: string, display?: string): Promise<number> => {
      const key = ingredientKey(raw);
      const known = ingredientIds.get(key);
      if (known !== undefined) return known;
      const res = await db.runAsync(
        'INSERT INTO ingredients (key, name, buy_mode) VALUES (?, ?, ?)',
        key, display ?? titleCase(key), defaultBuyMode(key),
      );
      ingredientIds.set(key, res.lastInsertRowId);
      return res.lastInsertRowId;
    };

    for (const k of KITCHEN) await upsertIngredient(k.name, k.name);

    for (const d of dishes) {
      const soakKey = soakIngredient(d.ingredients);
      // Dishes chosen during onboarding start ADDED; everything else starts as ADD.
      const active = chosen.has(d.name.toLowerCase());
      const res = await db.runAsync(
        `INSERT INTO dishes (name, slots, veg, protein_g, soak, soak_note, soak_hours, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        d.name, d.slots, d.veg ? 1 : 0, d.protein,
        soakKey ? 1 : 0, soakKey ? `Soak ${soakKey} overnight` : null, soakKey ? 8 : null,
        active ? 1 : 0,
      );
      for (const raw of d.ingredients) {
        const ingId = await upsertIngredient(raw);
        await db.runAsync('INSERT OR IGNORE INTO dish_ingredients (dish_id, ingredient_id) VALUES (?, ?)', res.lastInsertRowId, ingId);
      }
    }

    // Pantry: bulk items start 'ok' unless onboarding said the user is out of them.
    const ings = await db.getAllAsync<{ id: number; key: string; buy_mode: string }>('SELECT id, key, buy_mode FROM ingredients');
    const outKeys = new Set(Object.entries(kitchenHave).filter(([, have]) => have === false).map(([name]) => ingredientKey(name)));
    for (const ing of ings) {
      const level = ing.buy_mode === 'bulk' ? (outKeys.has(ing.key) ? 'out' : 'ok') : null;
      await db.runAsync('INSERT INTO pantry (ingredient_id, level) VALUES (?, ?)', ing.id, level);
    }

    const s = legacy.settings;
    if (s) {
      await db.runAsync('UPDATE cook SET name = ?, phone_e164 = ?, language = ? WHERE id = 1',
        s.cookName ?? '', s.cookNum ?? '', s.lang === 'hinglish' ? 'hinglish' : 'english');
      if (typeof s.protein === 'number' && s.protein > 0) {
        await db.runAsync('UPDATE settings SET protein_target_g = ? WHERE id = 1', s.protein);
      }
    }
  });
  return true;
}
