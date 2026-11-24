import { isFishDish } from '../../domain/ingredients';
import { addDays, dkey } from '../date';
import { PLAN_VERSION, upgradePlan } from '../replan';
import { isInRotation, setAddedDishNames } from '../rotation';
import type { DayPlan, Meal, Store } from '../../types';

const TODAY = new Date(2026, 10, 12);
const fish: Meal = { name: 'Fish Curry + Rice', p: 30, v: false, i: ['fish', 'rice'] };
const poha: Meal = { name: 'Poha with peanuts', p: 8, v: true, i: ['poha'] };

function store(plan: Record<string, DayPlan>, planVersion?: number): Store {
  return {
    settings: { cookName: '', cookNum: '', diet: 'both', protein: 60, lang: 'english', reminder: false },
    plan, done: {}, cur: dkey(TODAY), seeded: false, onboarded: true, planVersion,
    prefs: {
      authMode: 'guest', cuisines: [], regions: [], pantry: {},
      menu: { breakfast: [], lunch: ['Machha Besara + Rice', 'Chole + Rice'], snacks: [], dinner: ['Macha Jhola + Rice'] },
    },
  };
}

function allMeals(s: Store): Meal[] {
  return Object.values(s.plan).flatMap((d) => [d.breakfast, d.lunch, d.dinner]);
}

afterEach(() => setAddedDishNames([]));

describe('isFishDish', () => {
  it('catches fish by name (English and Odia) or ingredient, not mustard dishes', () => {
    expect(isFishDish('Machha Besara + Rice')).toBe(true);
    expect(isFishDish('Macha Jhola + Rice')).toBe(true);
    expect(isFishDish('Something', ['prawns'])).toBe(true);
    expect(isFishDish('Besara Mixed Veg + Roti', ['mixed vegetables', 'mustard'])).toBe(false);
  });
});

describe('upgradePlan', () => {
  it('re-plans the next 7 days once, with no fish, and drops fish from onboarding picks', () => {
    const s = store({ [dkey(TODAY)]: { breakfast: poha, lunch: fish, dinner: fish } });
    expect(upgradePlan(s, TODAY)).toBe(true);
    expect(s.planVersion).toBe(PLAN_VERSION);
    for (let i = 0; i < 7; i++) expect(s.plan[dkey(addDays(TODAY, i))]).toBeDefined();
    expect(allMeals(s).some((m) => isFishDish(m.name, m.i))).toBe(false);
    expect(s.prefs.menu.lunch).toEqual(['Chole + Rice']);
    expect(s.prefs.menu.dinner).toEqual([]);
  });

  it('does nothing on a later launch when the plan is already clean', () => {
    const s = store({ [dkey(TODAY)]: { breakfast: poha, lunch: poha, dinner: poha } }, PLAN_VERSION);
    expect(upgradePlan(s, TODAY)).toBe(false);
  });

  it('still replaces a fish meal found in an up-to-date plan', () => {
    const s = store({ [dkey(addDays(TODAY, -3))]: { breakfast: poha, lunch: fish, dinner: poha } }, PLAN_VERSION);
    expect(upgradePlan(s, TODAY)).toBe(true);
    expect(isFishDish(s.plan[dkey(addDays(TODAY, -3))].lunch.name)).toBe(false);
  });

  it('plans only ADDED dishes once some are added', () => {
    setAddedDishNames(['Poha with peanuts', 'Chole + Rice', 'Palak Paneer + 2 Roti']);
    expect(isInRotation('chole + rice')).toBe(true);
    expect(isInRotation('Rajma Chawal + salad')).toBe(false);
    const s = store({});
    s.prefs.menu = { breakfast: [], lunch: [], snacks: [], dinner: [] };
    upgradePlan(s, TODAY);
    const days = Object.values(s.plan);
    expect(days.every((d) => d.breakfast.name === 'Poha with peanuts')).toBe(true);
    expect(days.every((d) => d.lunch.name === 'Chole + Rice')).toBe(true);
    expect(days.every((d) => d.dinner.name === 'Palak Paneer + 2 Roti')).toBe(true);
  });

  it('uses every dish while nothing has been added', () => {
    expect(isInRotation('Anything at all')).toBe(true);
  });
});
