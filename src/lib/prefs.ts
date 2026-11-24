// Helpers that turn onboarding preferences into planner data.
import { DISHES } from '../data/cuisines';
import type { DayPlan, Diet, Meal, Prefs, Slot } from '../types';
import { isFishDish } from '../domain/ingredients';
import { pick } from './plan';
import { isInRotation } from './rotation';

export function defaultPrefs(): Prefs {
  return {
    authMode: 'guest',
    cuisines: [],
    regions: [],
    menu: { breakfast: [], lunch: [], snacks: [], dinner: [] },
    pantry: {},
  };
}

/** Build a Meal from a chosen dish name (looks it up for protein/veg/ingredients). */
export function mealFromDishName(name: string): Meal {
  const d = DISHES.find((x) => x.name === name);
  if (d) return { name: d.name, p: d.p, v: d.veg, i: d.i.slice() };
  return { name, p: 12, v: true, i: [] };
}

function randomFrom<T>(arr: T[]): T | undefined {
  return arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined;
}

/** Seed a day from the user's chosen dishes, falling back to the library per slot. */
export function seedDayFromPrefs(prefs: Prefs, diet: Diet = 'both'): DayPlan {
  const forSlot = (slot: Slot): Meal => {
    const chosen = randomFrom(prefs.menu[slot].filter((n) => !isFishDish(n) && isInRotation(n)));
    return chosen ? mealFromDishName(chosen) : pick(slot, diet, []);
  };
  return { breakfast: forSlot('breakfast'), lunch: forSlot('lunch'), dinner: forSlot('dinner') };
}
