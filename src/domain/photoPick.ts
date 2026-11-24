// Pure logic for auto-picking a dish photo from Unsplash search results.
// Unsplash's own ranking is poor for Indian dishes ("idli" returns sliced bread first),
// so we search the core dish name and pick the first result whose description
// actually mentions the dish or a close synonym. No match means no photo.

export interface UnsplashResult {
  id: string;
  alt_description?: string | null;
  description?: string | null;
  urls: { small: string; thumb: string; regular?: string; raw?: string };
  links: { html: string; download_location: string };
  user: { name: string; links: { html: string } };
}

export interface PickedPhoto {
  id: string;
  url: string;
  thumbUrl: string;
  author: string;
  authorUrl: string;
  pageUrl: string;
  downloadLocation: string;
}

/** Unsplash asks apps to tag links back to it with these parameters. */
export const UTM = 'utm_source=rasoi&utm_medium=referral';

/** Searches that work better than the literal dish name. */
const QUERY_ALIASES: Record<string, string> = {
  chole: 'chana masala',
  'moong dal chilla': 'moong dal cheela',
  'besan chilla': 'besan cheela',
  'idli': 'idli sambar',
};

/** Words that also count as a match for a dish word. */
const SYNONYMS: Record<string, string[]> = {
  chole: ['chana', 'chickpea'],
  chana: ['chickpea', 'chole'],
  idli: ['dumpling', 'rice cake', 'idly'],
  chilla: ['pancake', 'crepe', 'cheela'],
  dosa: ['crepe'],
  dal: ['lentil', 'daal', 'dhal'],
  rajma: ['kidney bean'],
  paneer: ['cottage cheese'],
  poha: ['flattened rice'],
  upma: ['semolina'],
  kadhi: ['yogurt curry'],
  khichdi: ['lentil', 'porridge'],
  roti: ['flatbread', 'chapati'],
  paratha: ['flatbread'],
  bhurji: ['scrambled'],
  soya: ['soy'],
  palak: ['spinach'],
  bhindi: ['okra'],
  methi: ['fenugreek'],
  aloo: ['potato'],
  gobi: ['cauliflower'],
  baingan: ['eggplant', 'aubergine', 'brinjal'],
  pulao: ['rice'],
  biryani: ['rice'],
};

// Words in dish names that say how it's served, not what it is.
const NOISE = new Set(['with', 'and', 'the', 'curd', 'salad', 'raita', 'bowl', 'roti', 'rice', 'toast', 'sabzi']);

/** "Idli + Sambar (3)" -> "idli"; "Palak Paneer + 2 Roti" -> "palak paneer". */
export function coreDishName(name: string): string {
  return name
    .split('+')[0]
    .replace(/\(.*?\)/g, ' ')
    .replace(/[0-9]/g, ' ')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function photoQuery(name: string): string {
  const core = coreDishName(name);
  return QUERY_ALIASES[core] ?? core;
}

/** Words (and synonyms) a result's description should contain to count as this dish. */
export function matchWords(name: string): string[] {
  const words = coreDishName(name).split(' ').filter((w) => w.length >= 3 && !NOISE.has(w));
  const out = new Set<string>();
  for (const w of words) {
    out.add(w);
    (SYNONYMS[w] ?? []).forEach((s) => out.add(s));
  }
  return [...out];
}

/** The dish's main word plus its synonyms, e.g. "rajma chawal" -> rajma, kidney bean. */
export function headWords(name: string): string[] {
  const head = coreDishName(name).split(' ').find((w) => w.length >= 3 && !NOISE.has(w));
  return head ? [head, ...(SYNONYMS[head] ?? [])] : [];
}

// Other dishes a photo might really show. If a photo's visual description names one of
// these and not our dish, it's a different dish (e.g. "dal makhani" for Rajma Chawal).
const OTHER_DISHES = [
  'dal makhani', 'biryani', 'butter chicken', 'chana masala', 'chole', 'paneer', 'dosa', 'idli', 'samosa',
  'pakora', 'pizza', 'burger', 'pasta', 'noodle', 'sushi', 'ramen', 'tikka', 'naan',
];

function namesOtherDish(alt: string, words: string[]): boolean {
  return OTHER_DISHES.some((o) => alt.includes(o) && !words.some((w) => o.includes(w) || w.includes(o)));
}

function score(result: UnsplashResult, words: string[], head: string[]): number {
  // The visual description (alt) says what is in the picture, so it counts double, and a
  // picture described as the dish itself gets a bonus; the photographer's caption counts once.
  const alt = (result.alt_description ?? '').toLowerCase();
  const desc = (result.description ?? '').toLowerCase();
  const words2 = words.reduce((n, w) => n + (alt.includes(w) ? 2 : 0) + (desc.includes(w) ? 1 : 0), 0);
  return words2 + (head.some((h) => alt.includes(h)) ? 3 : 0);
}

/**
 * Best-matching result for the dish, or null when nothing fits. A result must mention the
 * dish's main word (or a synonym), must not visibly be a different dish, and must not be
 * a photo the user rejected.
 */
export function pickBest(results: UnsplashResult[], name: string, rejected: string[] = []): UnsplashResult | null {
  const words = matchWords(name);
  const head = headWords(name);
  if (words.length === 0 || head.length === 0) return null;
  let best: UnsplashResult | null = null;
  let bestScore = 0;
  for (const r of results) {
    if (rejected.includes(r.id)) continue;
    const text = `${r.alt_description ?? ''} ${r.description ?? ''}`.toLowerCase();
    if (!head.some((h) => text.includes(h))) continue;
    if (namesOtherDish((r.alt_description ?? '').toLowerCase(), words)) continue;
    const s = score(r, words, head);
    if (s > bestScore) { best = r; bestScore = s; }
  }
  return best;
}

function withUtm(url: string): string {
  return `${url}${url.includes('?') ? '&' : '?'}${UTM}`;
}

export function toPickedPhoto(r: UnsplashResult): PickedPhoto {
  return {
    id: r.id,
    // Sharper than `small` (400px): a 640px square crop of the original. Unsplash allows
    // resizing via URL parameters on `raw` as long as its own parameters (ixid) are kept.
    url: r.urls.raw ? `${r.urls.raw}&w=640&h=640&fit=crop&crop=entropy&q=80&auto=format` : r.urls.small,
    thumbUrl: r.urls.thumb,
    author: r.user.name,
    authorUrl: withUtm(r.user.links.html),
    pageUrl: withUtm(r.links.html),
    downloadLocation: r.links.download_location,
  };
}
