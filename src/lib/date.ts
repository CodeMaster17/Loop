// Date helpers (local-time, no UTC drift).

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/** Local YYYY-MM-DD key (avoids the UTC shift from toISOString). */
export function dkey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export interface PrettyDate {
  rel: string;
  sub: string;
}

/** "Today / Tomorrow / Wed" + a short "7 Sep" subtitle. */
export function prettyDate(d: Date): PrettyDate {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const diff = Math.round((x.getTime() - t.getTime()) / 86400000);
  const rel = diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : diff === -1 ? 'Yesterday' : DAYS[x.getDay()];
  const sub = x.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  return { rel, sub };
}
