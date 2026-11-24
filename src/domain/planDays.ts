// The days shown on the Plan tab: today first, then the rest of the week.
import { addDays, DAYS, dkey } from '../lib/date';

export interface PlanDay {
  key: string;
  /** "Today", "Tomorrow", or a weekday name like "Fri". */
  label: string;
  /** "13 Nov" */
  sub: string;
  isToday: boolean;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function planDays(today: Date, count = 7): PlanDay[] {
  return Array.from({ length: count }, (_, i) => {
    const d = addDays(today, i);
    return {
      key: dkey(d),
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAYS[d.getDay()],
      sub: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
      isToday: i === 0,
    };
  });
}

/** Rounded average of daily protein totals (0 for no days). */
export function averageProtein(totals: number[]): number {
  if (totals.length === 0) return 0;
  return Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
}
