// Builds the WhatsApp message text for the cook / grocery run.
import { shelf } from '../data';
import type { DayPlan } from '../types';
import { weekIngredients } from './plan';

export function buildGroceryMessage(plan: Record<string, DayPlan>, done: Record<string, boolean>): string {
  const map = weekIngredients(plan);
  const fresh: string[] = [];
  const week: string[] = [];
  Object.keys(map).forEach((it) => {
    if (done[it]) return;
    (shelf(it) === 'fresh' ? fresh : week).push(it);
  });
  const cap = (a: string[]) => a.map((x) => `• ${x.replace(/\b\w/g, (c) => c.toUpperCase())}`).join('\n');
  return `🛒 Grocery list for the week:\n\n🥬 Buy fresh:\n${cap(fresh) || '—'}\n\n🫙 Staples to check:\n${cap(week) || '—'}`;
}
