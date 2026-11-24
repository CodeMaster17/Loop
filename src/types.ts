// Shared domain types for Rasoi.

export type Slot = 'breakfast' | 'lunch' | 'dinner';
/** Onboarding meal slots — includes evening snacks (the planner uses the 3 in Slot). */
export type OnbSlot = 'breakfast' | 'lunch' | 'snacks' | 'dinner';
export type Diet = 'veg' | 'both' | 'nonveg';
export type Lang = 'english' | 'hinglish';
export type Tab = 'plan' | 'menu' | 'grocery';
export type AuthMode = 'guest' | 'google';

/** A meal as it appears in a day's plan. */
export interface Meal {
  name: string;
  /** protein grams per serving */
  p: number;
  /** true = vegetarian */
  v: boolean;
  /** shopping ingredients */
  i: string[];
}

/** A meal entry in the built-in library (carries its slot). */
export interface LibMeal extends Meal {
  t: Slot;
  n: string; // display name (kept separate so LIB stays terse)
}

export interface DayPlan {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
}

export interface Recipe {
  name: string;
  protein: number;
  veg: boolean;
  why: string;
  items: string[];
}

export interface Settings {
  cookName: string;
  cookNum: string;
  diet: Diet;
  protein: number;
  lang: Lang;
  reminder: boolean;
  /** Emojis in cook messages (default on). */
  emoji?: boolean;
}

/** Preferences captured during onboarding. */
export interface Prefs {
  authMode: AuthMode;
  /** chosen cuisine ids */
  cuisines: string[];
  /** chosen region ids */
  regions: string[];
  /** selected dish names per meal slot */
  menu: Record<OnbSlot, string[]>;
  /** kitchen item name -> already present */
  pantry: Record<string, boolean>;
}

/** The whole persisted app state. */
export interface Store {
  settings: Settings;
  /** date key (YYYY-MM-DD) -> plan */
  plan: Record<string, DayPlan>;
  /** grocery item -> checked off */
  done: Record<string, boolean>;
  /** currently viewed date key */
  cur: string;
  /** true until the user makes their first real edit (shows the "example" tag) */
  seeded: boolean;
  /** false until the onboarding flow is finished */
  onboarded: boolean;
  /** Version of the saved plan format/rules; see lib/replan.ts. Missing = 1. */
  planVersion?: number;
  /** onboarding choices */
  prefs: Prefs;
}
