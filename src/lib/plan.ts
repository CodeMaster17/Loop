// Meal-planning logic built on the library.
import { LIB } from '../data';
import { DISHES } from '../data/cuisines';
import { isFishDish } from '../domain/ingredients';
import { isInRotation } from './rotation';
import type { DayPlan, Diet, LibMeal, Meal, Slot } from '../types';
import { addDays, dkey } from './date';

const SLOTS: Slot[] = ['breakfast', 'lunch', 'dinner'];

/** Every plannable dish: the built-in library plus the onboarding dishes (snacks aren't planned). */
const ALL: LibMeal[] = (() => {
  const seen = new Set<string>();
  const out: LibMeal[] = [];
  const add = (m: LibMeal) => {
    const k = `${m.t}|${m.name.toLowerCase()}`;
    if (!seen.has(k)) { seen.add(k); out.push(m); }
  };
  LIB.forEach(add);
  DISHES.forEach((d) => {
    if (d.slot === 'snacks') return;
    add({ t: d.slot, n: d.name, name: d.name, p: d.p, v: d.veg, i: d.i.slice() });
  });
  return out;
})();

/**
 * Pick a meal for a slot: never fish, only dishes you ADDED on the Menu card (if none of
 * those fit this slot, any dish does), honouring diet and avoiding recent dishes.
 */
export function pick(type: Slot, diet: Diet, avoid: string[] = []): Meal {
  const base = ALL.filter((m) => {
    if (m.t !== type) return false;
    if (isFishDish(m.name, m.i)) return false;
    if (diet === 'veg' && !m.v) return false;
    if (diet === 'nonveg' && m.v && Math.random() > 0.35) return false;
    return true;
  });
  const added = base.filter((m) => isInRotation(m.name));
  const pool = added.length ? added : base;
  const fresh = pool.filter((m) => avoid.indexOf(m.name) < 0);
  const use = fresh.length ? fresh : pool;
  const m = use[Math.floor(Math.random() * use.length)] ?? pool[0];
  return { name: m.name, p: m.p, v: m.v, i: m.i.slice() };
}

export function seedDay(diet: Diet, avoid: string[] = []): DayPlan {
  return {
    breakfast: pick('breakfast', diet, avoid),
    lunch: pick('lunch', diet, avoid),
    dinner: pick('dinner', diet, avoid),
  };
}

/** Every dish name currently in the plan (used to avoid repeats). */
export function recentNames(plan: Record<string, DayPlan>): string[] {
  const out: string[] = [];
  Object.values(plan).forEach((d) => SLOTS.forEach((s) => { if (d[s]) out.push(d[s].name); }));
  return out;
}

export function dayProtein(d?: DayPlan | null): number {
  if (!d) return 0;
  return d.breakfast.p + d.lunch.p + d.dinner.p;
}

/** Aggregate the next 7 days' ingredients into { item: count }. */
export function weekIngredients(plan: Record<string, DayPlan>): Record<string, number> {
  const today = new Date();
  const map: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const day = plan[dkey(addDays(today, i))];
    if (!day) continue;
    SLOTS.forEach((s) => {
      day[s].i.forEach((it) => {
        const k = it.toLowerCase().trim();
        map[k] = (map[k] ?? 0) + 1;
      });
    });
  }
  return map;
}
