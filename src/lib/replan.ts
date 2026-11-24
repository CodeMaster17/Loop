// One-time upgrades to the saved week plan (the legacy AsyncStorage store).
// v2: no fish or seafood — drop fish from onboarding choices and re-plan the next 7 days.
import { isFishDish } from '../domain/ingredients';
import type { DayPlan, Slot, Store } from '../types';
import { addDays, dkey } from './date';
import { pick, recentNames, seedDay } from './plan';
import { seedDayFromPrefs } from './prefs';

export const PLAN_VERSION = 2;

const SLOTS: Slot[] = ['breakfast', 'lunch', 'dinner'];

function hasChosenDishes(s: Store): boolean {
  return SLOTS.some((slot) => (s.prefs?.menu?.[slot] ?? []).length > 0);
}

/** Fresh plan for one day: from the user's chosen dishes if any, else the library. */
export function newDay(s: Store, avoid: string[]): DayPlan {
  return hasChosenDishes(s) ? seedDayFromPrefs(s.prefs, s.settings.diet) : seedDay(s.settings.diet, avoid);
}

/**
 * Bring a saved store up to PLAN_VERSION. Mutates `s`; returns true if anything changed.
 * Also replaces any fish meal still in the plan (older days included), as a safety net.
 */
export function upgradePlan(s: Store, today: Date = new Date()): boolean {
  let changed = false;

  if ((s.planVersion ?? 1) < PLAN_VERSION) {
    if (s.prefs?.menu) {
      for (const slot of Object.keys(s.prefs.menu) as (keyof typeof s.prefs.menu)[]) {
        s.prefs.menu[slot] = s.prefs.menu[slot].filter((name) => !isFishDish(name));
      }
    }
    for (let i = 0; i < 7; i++) delete s.plan[dkey(addDays(today, i))];
    for (let i = 0; i < 7; i++) s.plan[dkey(addDays(today, i))] = newDay(s, recentNames(s.plan));
    s.cur = dkey(today);
    s.planVersion = PLAN_VERSION;
    changed = true;
  }

  for (const day of Object.values(s.plan)) {
    for (const slot of SLOTS) {
      const meal = day[slot];
      if (meal && isFishDish(meal.name, meal.i)) {
        day[slot] = pick(slot, s.settings.diet, [meal.name]);
        changed = true;
      }
    }
  }
  return changed;
}
