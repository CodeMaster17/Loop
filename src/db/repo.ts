// Typed read/write helpers over the SQLite tables. Screens move onto these in Phase 1.
import type { BuyMode } from '../domain/ingredients';
import type { Slot } from '../types';
import type { Db } from './db';

export type CookLanguage = 'english' | 'hinglish' | 'hindi';
export type PantryLevel = 'ok' | 'low' | 'out';

export interface Dish {
  id: number;
  name: string;
  slots: Slot[];
  /** Evening-snack dish (stored, not planned yet). */
  snack: boolean;
  veg: boolean;
  proteinG: number;
  cookNote: string | null;
  soak: boolean;
  soakNote: string | null;
  youtubeUrl: string | null;
  active: boolean;
  photo: DishPhoto | null;
}

/** A dish photo plus the credit Unsplash requires wherever it is shown. */
export interface DishPhoto {
  url: string;
  thumbUrl: string;
  author: string;
  authorUrl: string;
  pageUrl: string;
}

export interface Ingredient {
  id: number;
  key: string;
  name: string;
  buyMode: BuyMode;
  level: PantryLevel | null;
}

export interface AppSettings {
  proteinTargetG: number;
  /** JS getDay() numbers (0 = Sunday) the cook works. */
  cookDays: number[];
  cooldownDays: number;
  servingsDefault: number;
}

export interface Cook {
  name: string;
  phone: string;
  language: CookLanguage;
}

const SLOT_BITS: [Slot, number][] = [['breakfast', 1], ['lunch', 2], ['dinner', 4]];

export function slotsFromBits(bits: number): Slot[] {
  return SLOT_BITS.filter(([, b]) => (bits & b) !== 0).map(([s]) => s);
}

export function bitsFromSlots(slots: Slot[]): number {
  return SLOT_BITS.reduce((acc, [s, b]) => (slots.includes(s) ? acc | b : acc), 0);
}

interface DishRow {
  id: number; name: string; slots: number; veg: number; protein_g: number;
  cook_note: string | null; soak: number; soak_note: string | null; youtube_url: string | null; active: number;
  photo_url: string | null; photo_thumb_url: string | null; photo_author: string | null;
  photo_author_url: string | null; photo_page_url: string | null;
}

function photoFromRow(r: DishRow): DishPhoto | null {
  if (!r.photo_url || !r.photo_thumb_url || !r.photo_author || !r.photo_author_url || !r.photo_page_url) return null;
  return { url: r.photo_url, thumbUrl: r.photo_thumb_url, author: r.photo_author, authorUrl: r.photo_author_url, pageUrl: r.photo_page_url };
}

export async function listDishes(db: Db, opts: { activeOnly?: boolean } = {}): Promise<Dish[]> {
  const rows = await db.getAllAsync<DishRow>(
    `SELECT id, name, slots, veg, protein_g, cook_note, soak, soak_note, youtube_url, active,
            photo_url, photo_thumb_url, photo_author, photo_author_url, photo_page_url
     FROM dishes ${opts.activeOnly ? 'WHERE active = 1' : ''} ORDER BY name COLLATE NOCASE`,
  );
  return rows.map((r) => ({
    id: r.id, name: r.name, slots: slotsFromBits(r.slots), snack: (r.slots & 8) !== 0, veg: r.veg === 1, proteinG: r.protein_g,
    cookNote: r.cook_note, soak: r.soak === 1, soakNote: r.soak_note, youtubeUrl: r.youtube_url, active: r.active === 1,
    photo: photoFromRow(r),
  }));
}

export async function listIngredients(db: Db): Promise<Ingredient[]> {
  const rows = await db.getAllAsync<{ id: number; key: string; name: string; buy_mode: BuyMode; level: PantryLevel | null }>(
    `SELECT i.id, i.key, i.name, i.buy_mode, p.level
     FROM ingredients i LEFT JOIN pantry p ON p.ingredient_id = i.id
     WHERE i.deleted = 0 ORDER BY i.name COLLATE NOCASE`,
  );
  return rows.map((r) => ({ id: r.id, key: r.key, name: r.name, buyMode: r.buy_mode, level: r.level }));
}

export async function getSettings(db: Db): Promise<AppSettings> {
  const r = await db.getFirstAsync<{ protein_target_g: number; cook_days: string; cooldown_days: number; servings_default: number }>(
    'SELECT protein_target_g, cook_days, cooldown_days, servings_default FROM settings WHERE id = 1',
  );
  if (!r) throw new Error('settings row missing — migrations did not run');
  return {
    proteinTargetG: r.protein_target_g,
    cookDays: r.cook_days.split(',').filter(Boolean).map(Number),
    cooldownDays: r.cooldown_days,
    servingsDefault: r.servings_default,
  };
}

export async function updateSettings(db: Db, patch: Partial<AppSettings>): Promise<void> {
  const next = { ...(await getSettings(db)), ...patch };
  await db.runAsync(
    'UPDATE settings SET protein_target_g = ?, cook_days = ?, cooldown_days = ?, servings_default = ? WHERE id = 1',
    next.proteinTargetG, [...next.cookDays].sort((a, b) => a - b).join(','), next.cooldownDays, next.servingsDefault,
  );
}

export async function getCook(db: Db): Promise<Cook> {
  const r = await db.getFirstAsync<{ name: string; phone_e164: string; language: CookLanguage }>(
    'SELECT name, phone_e164, language FROM cook WHERE id = 1',
  );
  if (!r) throw new Error('cook row missing — migrations did not run');
  return { name: r.name, phone: r.phone_e164, language: r.language };
}

export async function saveCook(db: Db, cook: Cook): Promise<void> {
  await db.runAsync('UPDATE cook SET name = ?, phone_e164 = ?, language = ? WHERE id = 1', cook.name, cook.phone, cook.language);
}

export interface DbSummary {
  dishes: number;
  activeDishes: number;
  soakDishes: number;
  bulkIngredients: number;
  weeklyIngredients: number;
}

export async function summary(db: Db): Promise<DbSummary> {
  const r = await db.getFirstAsync<{ d: number; a: number; s: number; b: number; w: number }>(
    `SELECT (SELECT COUNT(*) FROM dishes) AS d,
            (SELECT COUNT(*) FROM dishes WHERE active = 1) AS a,
            (SELECT COUNT(*) FROM dishes WHERE soak = 1) AS s,
            (SELECT COUNT(*) FROM ingredients WHERE deleted = 0 AND buy_mode = 'bulk') AS b,
            (SELECT COUNT(*) FROM ingredients WHERE deleted = 0 AND buy_mode = 'weekly') AS w`,
  );
  return { dishes: r?.d ?? 0, activeDishes: r?.a ?? 0, soakDishes: r?.s ?? 0, bulkIngredients: r?.b ?? 0, weeklyIngredients: r?.w ?? 0 };
}

/** Dishes still without a photo, active ones first; skips dishes checked in the last `retryDays`. */
export async function dishesNeedingPhoto(
  db: Db, limit: number, retryDays = 7, now = new Date(),
): Promise<{ id: number; name: string; rejected: string[] }[]> {
  const cutoff = new Date(now.getTime() - retryDays * 86400000).toISOString();
  const rows = await db.getAllAsync<{ id: number; name: string; photo_rejected: string | null }>(
    `SELECT id, name, photo_rejected FROM dishes
     WHERE photo_url IS NULL AND (photo_checked_at IS NULL OR photo_checked_at < ?)
     ORDER BY active DESC, id ASC LIMIT ?`,
    cutoff, limit,
  );
  return rows.map((r) => ({ id: r.id, name: r.name, rejected: (r.photo_rejected ?? '').split(',').filter(Boolean) }));
}

/** "Wrong photo": remember it so it's never picked again, and clear it so a new one is searched. */
export async function rejectDishPhoto(db: Db, dishId: number): Promise<void> {
  await db.runAsync(
    `UPDATE dishes
     SET photo_rejected = CASE WHEN photo_rejected IS NULL OR photo_rejected = '' THEN photo_id ELSE photo_rejected || ',' || photo_id END,
         photo_id = NULL, photo_url = NULL, photo_thumb_url = NULL, photo_author = NULL,
         photo_author_url = NULL, photo_page_url = NULL, photo_source = NULL, photo_checked_at = NULL
     WHERE id = ? AND photo_id IS NOT NULL`,
    dishId,
  );
}

export interface SavedPhoto extends DishPhoto { id: string; source: 'unsplash' }

/** Save a photo for a dish, or record that none matched (so it isn't searched again for a while). */
export async function setDishPhoto(db: Db, dishId: number, photo: SavedPhoto | null, now = new Date()): Promise<void> {
  await db.runAsync(
    `UPDATE dishes SET photo_id = ?, photo_url = ?, photo_thumb_url = ?, photo_author = ?, photo_author_url = ?,
       photo_page_url = ?, photo_source = ?, photo_checked_at = ? WHERE id = ?`,
    photo?.id ?? null, photo?.url ?? null, photo?.thumbUrl ?? null, photo?.author ?? null, photo?.authorUrl ?? null,
    photo?.pageUrl ?? null, photo?.source ?? null, now.toISOString(), dishId,
  );
}

/** name (lowercase) -> photo, for screens that still know meals by name. */
export async function photosByDishName(db: Db): Promise<Record<string, DishPhoto>> {
  const out: Record<string, DishPhoto> = {};
  for (const d of await listDishes(db)) if (d.photo) out[d.name.toLowerCase()] = d.photo;
  return out;
}

/** Put a dish in (or take it out of) the weekly rotation. */
export async function setDishActive(db: Db, dishId: number, active: boolean): Promise<void> {
  await db.runAsync('UPDATE dishes SET active = ? WHERE id = ?', active ? 1 : 0, dishId);
}

/** Attach (or clear, with null) a YouTube recipe video for a dish. */
export async function setDishYoutube(db: Db, dishId: number, video: { id: string; url: string } | null): Promise<void> {
  await db.runAsync('UPDATE dishes SET youtube_id = ?, youtube_url = ? WHERE id = ?', video?.id ?? null, video?.url ?? null, dishId);
}

/** name (lowercase) -> YouTube link, for building cook messages. */
export async function videosByDishName(db: Db): Promise<Record<string, string>> {
  const rows = await db.getAllAsync<{ name: string; youtube_url: string }>(
    'SELECT name, youtube_url FROM dishes WHERE youtube_url IS NOT NULL',
  );
  const out: Record<string, string> = {};
  rows.forEach((r) => { out[r.name.toLowerCase()] = r.youtube_url; });
  return out;
}
