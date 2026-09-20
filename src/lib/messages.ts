// Builds the WhatsApp message text for the cook / grocery run.
import { shelf } from '../data';
import type { DayPlan, Settings } from '../types';
import { prettyDate } from './date';
import { weekIngredients } from './plan';

export function buildMenuMessage(plan: Record<string, DayPlan>, key: string, settings: Settings): string {
  const d = plan[key];
  if (!d) return '';
  const pd = prettyDate(new Date(key));
  const when = `${pd.rel} (${pd.sub})`;
  const name = settings.cookName ? ` ${settings.cookName}` : '';
  if (settings.lang === 'hinglish') {
    return `Namaste${name} 🙏 ${when} ka menu:\n\n`
      + `🌅 Nashta: ${d.breakfast.name}\n`
      + `🍛 Lunch: ${d.lunch.name}\n`
      + `🌙 Raat ka khana: ${d.dinner.name}\n\nDhanyavaad!`;
  }
  return `Hi${name} 🙏 Menu for ${when}:\n\n`
    + `🌅 Breakfast: ${d.breakfast.name}\n`
    + `🍛 Lunch: ${d.lunch.name}\n`
    + `🌙 Dinner: ${d.dinner.name}\n\nThank you!`;
}

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
