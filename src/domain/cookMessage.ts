// WhatsApp message for the cook. The cook comes twice a day, so a day's menu can be sent
// as "breakfast + lunch" (morning visit), "dinner" (evening visit), or the whole day.
// Each dish with a recipe video gets its YouTube link on the next line.

export type MessagePart = 'morning' | 'dinner' | 'all';
export type MessageLang = 'english' | 'hinglish';

export interface CookMessageInput {
  /** "Today", "Tomorrow" or a weekday like "Fri". */
  dayLabel: string;
  /** "13 Nov" */
  dateSub: string;
  cookName: string;
  lang: MessageLang;
  part: MessagePart;
  meals: { breakfast: string; lunch: string; dinner: string };
  /** lowercase dish name -> YouTube link */
  videos: Record<string, string>;
  emoji: boolean;
}

const LABELS = {
  english: { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', recipe: 'Recipe', hi: 'Hi', thanks: 'Thank you!' },
  hinglish: { breakfast: 'Nashta', lunch: 'Lunch', dinner: 'Raat ka khana', recipe: 'Recipe', hi: 'Namaste', thanks: 'Dhanyavaad!' },
} as const;

const ICON = { breakfast: '🌅', lunch: '🍛', dinner: '🌙', recipe: '▶️', hi: '🙏' } as const;

function heading(i: CookMessageInput): string {
  const { dayLabel: day, dateSub: date, part } = i;
  if (i.lang === 'hinglish') {
    const when = day === 'Today' ? `Aaj (${date})` : day === 'Tomorrow' ? `Kal (${date})` : `${day} (${date})`;
    const what = part === 'morning' ? 'ka nashta aur lunch' : part === 'dinner' ? 'raat ka khana' : 'ka menu';
    return `${when} ${what}:`;
  }
  if (part === 'dinner') {
    return day === 'Today' ? `Tonight's dinner (${date}):` : `Dinner for ${day === 'Tomorrow' ? 'tomorrow' : day} (${date}):`;
  }
  const what = part === 'morning' ? 'breakfast & lunch' : 'menu';
  const when = day === 'Today' ? "Today's" : day === 'Tomorrow' ? "Tomorrow's" : `${day}'s`;
  return `${when} ${what} (${date}):`;
}

export function buildCookMessage(i: CookMessageInput): string {
  const L = LABELS[i.lang];
  const slots = i.part === 'morning' ? (['breakfast', 'lunch'] as const)
    : i.part === 'dinner' ? (['dinner'] as const)
      : (['breakfast', 'lunch', 'dinner'] as const);

  const greet = `${L.hi}${i.cookName ? ` ${i.cookName}` : ''}${i.emoji ? ` ${ICON.hi}` : ','}`;
  const lines: string[] = [greet, heading(i), ''];
  for (const slot of slots) {
    const dish = i.meals[slot];
    lines.push(`${i.emoji ? `${ICON[slot]} ` : ''}${L[slot]}: ${dish}`);
    const video = i.videos[dish.toLowerCase()];
    if (video) lines.push(`${i.emoji ? `${ICON.recipe} ` : '   '}${L.recipe}: ${video}`);
  }
  lines.push('', L.thanks);
  return lines.join('\n');
}

/** Sensible default: for today after noon the morning meals are done, so suggest dinner. */
export function defaultPart(dayLabel: string, now: Date = new Date()): MessagePart {
  return dayLabel === 'Today' && now.getHours() >= 12 ? 'dinner' : 'morning';
}
