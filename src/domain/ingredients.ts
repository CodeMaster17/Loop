// Pure rules about ingredients: canonical keys, bulk vs weekly, and what needs soaking.

export type BuyMode = 'bulk' | 'weekly';

/** Kitchen names that mean the same thing as a dish ingredient name. */
const ALIASES: Record<string, string> = {
  'wheat flour (atta)': 'atta',
  'turmeric (haldi)': 'turmeric',
  'cumin (jeera)': 'cumin',
  'green chilli': 'green chili',
  'mustard seeds': 'mustard',
  'cooking oil': 'oil',
  semolina: 'sooji',
  'flattened rice': 'poha',
};

/** Stable lowercase key used to match the same ingredient across data sources. */
export function ingredientKey(name: string): string {
  const k = name.trim().toLowerCase().replace(/\s+/g, ' ');
  return ALIASES[k] ?? k;
}

/** "toor dal" -> "Toor Dal". */
export function titleCase(s: string): string {
  return s.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

// Shelf-stable things bought in bulk: grains, flours, dals, spices, oils.
const BULK = /\b(rice|atta|dal|besan|sugar|salt|jaggery|rajma|chole|chana|peanuts?|sooji|rava|poha|oats|maida|flour|powder|masala|mustard|cumin|jeera|turmeric|haldi|hing|seeds?|spices?|ghee|oil|tea|coffee|tamarind|soya|yellow peas)\b/;

/** Default buy mode for an ingredient the user hasn't classified yet. */
export function defaultBuyMode(name: string): BuyMode {
  return BULK.test(ingredientKey(name)) ? 'bulk' : 'weekly';
}

// Whole legumes that are soaked overnight. Split dals (chana dal, moong dal) are not.
const SOAK = /\b(rajma|chole|kabuli chana|kala chana|black chana|black dal|whole urad|sabut urad|lobia|chawli|yellow peas)\b/;

/** The first ingredient in a dish that needs an overnight soak, if any. */
export function soakIngredient(ingredients: string[]): string | null {
  for (const raw of ingredients) {
    const k = ingredientKey(raw);
    if (SOAK.test(k)) return k;
  }
  return null;
}

// Fish and seafood are never planned (personal preference). Matches dish names in English
// and Odia/Bengali ("machha", "macha", "maach") and seafood ingredients.
const FISH = /\b(fish|machh?a|maachh?|prawns?|shrimps?|jhinga|pomfret|rohu|surmai|bangda|crabs?|seafood|lobster|squid)\b/i;

/** True for any dish that contains fish or seafood, judged by its name or ingredients. */
export function isFishDish(name: string, ingredients: string[] = []): boolean {
  return FISH.test(name) || ingredients.some((i) => FISH.test(i));
}
