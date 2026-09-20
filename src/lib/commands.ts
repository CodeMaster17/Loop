// Keyword parser for voice / typed edits.
// (Natural-language understanding is planned via the AI backend; this is the offline fallback.)
import { LIB } from '../data';
import type { DayPlan, Diet, Slot } from '../types';
import { pick, seedDay } from './plan';

/** Apply a spoken/typed instruction to `day` (mutates it). Returns true if something changed. */
export function applyCommand(cmd: string, day: DayPlan, diet: Diet): boolean {
  const c = cmd.toLowerCase();

  if (/veg day|make it veg|all veg|pure veg/.test(c)) {
    const fresh = seedDay('veg', []);
    day.breakfast = fresh.breakfast;
    day.lunch = fresh.lunch;
    day.dinner = fresh.dinner;
    return true;
  }

  const slot: Slot | null =
    /breakfast|nashta|subah|morning/.test(c) ? 'breakfast'
    : /lunch|dopahar|afternoon/.test(c) ? 'lunch'
    : /dinner|raat|night|evening/.test(c) ? 'dinner'
    : null;
  if (!slot) return false;

  const mt = c.match(/(?:to|banao|banana|kar do|for|as)\s+(.+)$/);
  if (mt && mt[1]) {
    const raw = mt[1].trim();
    const word = raw.split(' ')[0] ?? raw;
    const found = LIB.find((m) => m.name.toLowerCase().indexOf(word) > -1);
    day[slot] = found
      ? { name: found.name, p: found.p, v: found.v, i: found.i.slice() }
      : { name: raw.replace(/\b\w/g, (x) => x.toUpperCase()), p: 15, v: true, i: [] };
    return true;
  }

  if (/high protein|zyada protein|more protein|protein/.test(c)) {
    day[slot] = pick(slot, 'both', [day[slot].name]);
    if (day[slot].p < 20) day[slot].p += 8;
    return true;
  }

  day[slot] = pick(slot, diet, [day[slot].name]);
  return true;
}
