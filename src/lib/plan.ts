// Meal-planning logic built on the library.
import { LIB } from '../data';
import type { DayPlan, Diet, Meal, Slot } from '../types';
import { addDays, dkey } from './date';

const SLOTS: Slot[] = ['breakfast', 'lunch', 'dinner'];

/** Pick a meal for a slot, honouring diet and avoiding recent dishes. */
export function pick(type: Slot, diet: Diet, avoid: string[] = []): Meal {
  const pool = LIB.filter((m) => {
    if (m.t !== type) return false;
    if (diet === 'veg' && !m.v) return false;
    if (diet === 'nonveg' && m.v && Math.random() > 0.35) return false;
    return true;
  });
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
