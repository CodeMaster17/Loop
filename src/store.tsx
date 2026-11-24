// Central app state: one persisted Store plus all the actions that mutate it,
// exposed through React context so any screen/sheet can reach it.
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getDb } from './db/open';
import { applyCommand } from './lib/commands';
import { addDays, dkey } from './lib/date';
import { cancelReminder, scheduleDailyReminder } from './lib/notifications';
import { pick, recentNames, seedDay } from './lib/plan';
import { defaultPrefs, seedDayFromPrefs } from './lib/prefs';
import { PLAN_VERSION, upgradePlan } from './lib/replan';
import type { DayPlan, Lang, Prefs, Recipe, Settings, Slot, Store } from './types';

const KEY = 'rasoiPlanner.v1';

export function freshStore(): Store {
  const store: Store = {
    settings: { cookName: '', cookNum: '', diet: 'both', protein: 60, lang: 'english', reminder: false },
    plan: {},
    done: {},
    cur: dkey(new Date()),
    seeded: true,
    onboarded: false,
    planVersion: PLAN_VERSION,
    prefs: defaultPrefs(),
  };
  const today = new Date();
  for (let i = 0; i < 7; i++) store.plan[dkey(addDays(today, i))] = seedDay('both', recentNames(store.plan));
  return store;
}

export interface StoreApi {
  store: Store;
  newPlan: () => void;
  swap: (slot: Slot) => void;
  /** Swap one meal on a given day (date key) for another dish. */
  swapAt: (key: string, slot: Slot) => void;
  shiftDay: (delta: number) => void;
  planWeek: () => void;
  addRecipeToToday: (r: Recipe) => void;
  applyVoiceCommand: (cmd: string) => boolean;
  toggleGroceryDone: (item: string) => void;
  setLang: (lang: Lang) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setReminder: (on: boolean) => Promise<void>;
  /** Finish onboarding: save prefs, flip the gate, and seed the week from chosen dishes. */
  completeOnboarding: (prefs: Prefs) => void;
}

const StoreContext = createContext<StoreApi | null>(null);

export function useStore(): StoreApi {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore must be used within <StoreProvider>');
  return value;
}

export function StoreProvider({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const [store, setStore] = useState<Store | null>(null);

  // Load persisted state (or seed a fresh week on first run).
  useEffect(() => {
    (async () => {
      // Load the menu card's rotation (ADD / ADDED) first, so any re-plan below respects it.
      await getDb().catch(() => {});
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const s = JSON.parse(raw) as Store;
          if (s && s.plan) {
            if (!s.done) s.done = {};
            if (typeof s.onboarded !== 'boolean') s.onboarded = false;
            if (!s.prefs) s.prefs = defaultPrefs();
            if (upgradePlan(s)) AsyncStorage.setItem(KEY, JSON.stringify(s)).catch(() => {});
            setStore(s);
            return;
          }
        }
      } catch {
        /* fall through to fresh */
      }
      const fs = freshStore();
      setStore(fs);
      AsyncStorage.setItem(KEY, JSON.stringify(fs)).catch(() => {});
    })();
  }, []);

  const commit = useCallback((fn: (s: Store) => void) => {
    setStore((prev) => {
      if (!prev) return prev;
      const next: Store = JSON.parse(JSON.stringify(prev));
      fn(next);
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  // Keep the next 7 days seeded (runs after render, never during it).
  useEffect(() => {
    if (!store) return;
    const today = new Date();
    let missing = false;
    for (let i = 0; i < 7; i++) if (!store.plan[dkey(addDays(today, i))]) { missing = true; break; }
    if (missing) {
      // Legacy AsyncStorage store — replaced by the SQLite rotation in Phase 1.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      commit((n) => {
        for (let i = 0; i < 7; i++) {
          const k = dkey(addDays(today, i));
          if (!n.plan[k]) n.plan[k] = seedDay(n.settings.diet, recentNames(n.plan));
        }
      });
    }
  }, [store, commit]);

  if (!store) return <>{fallback ?? null}</>;

  const api: StoreApi = {
    store,
    newPlan: () => commit((n) => { n.plan[n.cur] = seedDay(n.settings.diet, recentNames(n.plan)); n.seeded = false; }),
    swap: (slot) => commit((n) => {
      const cur = n.plan[n.cur][slot];
      n.plan[n.cur][slot] = pick(slot, n.settings.diet, [cur.name]);
      n.seeded = false;
    }),
    swapAt: (key, slot) => commit((n) => {
      const day = n.plan[key];
      if (!day) return;
      day[slot] = pick(slot, n.settings.diet, [day[slot].name]);
      n.seeded = false;
    }),
    shiftDay: (delta) => commit((n) => {
      n.cur = dkey(addDays(new Date(n.cur), delta));
      if (!n.plan[n.cur]) n.plan[n.cur] = seedDay(n.settings.diet, recentNames(n.plan));
    }),
    planWeek: () => commit((n) => {
      const today = new Date();
      for (let i = 0; i < 7; i++) n.plan[dkey(addDays(today, i))] = seedDay(n.settings.diet, recentNames(n.plan));
      n.seeded = false;
    }),
    addRecipeToToday: (r) => commit((n) => {
      const slot: Slot = r.protein >= 25 ? 'dinner' : 'lunch';
      n.plan[n.cur][slot] = { name: r.name, p: Math.round(r.protein), v: r.veg, i: r.items ?? [] };
      n.seeded = false;
    }),
    applyVoiceCommand: (cmd) => {
      const dayClone: DayPlan = JSON.parse(JSON.stringify(store.plan[store.cur]));
      const applied = applyCommand(cmd, dayClone, store.settings.diet);
      if (applied) commit((n) => { n.plan[n.cur] = dayClone; n.seeded = false; });
      return applied;
    },
    toggleGroceryDone: (item) => commit((n) => { n.done[item] = !n.done[item]; }),
    setLang: (lang) => commit((n) => { n.settings.lang = lang; }),
    updateSettings: (patch) => commit((n) => { Object.assign(n.settings, patch); }),
    setReminder: async (on) => {
      commit((n) => { n.settings.reminder = on; });
      if (on) await scheduleDailyReminder(); else await cancelReminder();
    },
    completeOnboarding: (prefs) => commit((n) => {
      n.prefs = prefs;
      n.onboarded = true;
      const today = new Date();
      n.plan = {};
      for (let i = 0; i < 7; i++) n.plan[dkey(addDays(today, i))] = seedDayFromPrefs(prefs, n.settings.diet);
      n.cur = dkey(today);
      n.seeded = true;
    }),
  };

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}
