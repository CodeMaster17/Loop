// Which thiings.co icon to show for a grocery item. Pure; the image files are in
// assets/grocery/<slug>.png (see src/design/groceryIconImages.ts).
import { ingredientKey } from './ingredients';

export type GroceryIcon =
  | 'tomato' | 'onion' | 'potato' | 'garlic' | 'ginger-root' | 'chili-pepper' | 'red-chili' | 'lemon'
  | 'cilantro' | 'spinach' | 'bay-leaf' | 'fenugreek-leaves' | 'eggplant' | 'cauliflower' | 'green-pepper'
  | 'carrot' | 'cucumber' | 'pea-pod' | 'banana' | 'coconut' | 'chopped-vegetables' | 'milk' | 'yogurt'
  | 'paneer' | 'butter' | 'ghee' | 'egg' | 'chicken-raw' | 'fish' | 'tofu' | 'bread-white' | 'rice' | 'flour'
  | 'lentils' | 'red-beans' | 'chickpea' | 'sprout' | 'peanut' | 'puffed-rice-snack' | 'oats' | 'soya-beans'
  | 'salt' | 'sugar' | 'tea' | 'filter-coffee' | 'vegetable-oil' | 'mustard' | 'turmeric-powder'
  | 'spice-blends' | 'spice-rack' | 'tamarind-pod';

const EXACT: Record<string, GroceryIcon> = {
  tomato: 'tomato', onion: 'onion', potato: 'potato', garlic: 'garlic', ginger: 'ginger-root',
  'green chili': 'chili-pepper', 'red chilli powder': 'red-chili', lemon: 'lemon', coriander: 'cilantro',
  spinach: 'spinach', 'curry leaves': 'bay-leaf', fenugreek: 'fenugreek-leaves', okra: 'chopped-vegetables',
  brinjal: 'eggplant', cauliflower: 'cauliflower', capsicum: 'green-pepper', carrot: 'carrot',
  cucumber: 'cucumber', peas: 'pea-pod', 'raw banana': 'banana', coconut: 'coconut',
  'mixed vegetables': 'chopped-vegetables', milk: 'milk', curd: 'yogurt', paneer: 'paneer', chhena: 'paneer',
  butter: 'butter', ghee: 'ghee', eggs: 'egg', chicken: 'chicken-raw', fish: 'fish', tofu: 'tofu',
  bread: 'bread-white', rice: 'rice', 'idli batter': 'rice', 'dosa batter': 'rice', rajma: 'red-beans',
  chole: 'chickpea', 'moong sprouts': 'sprout', peanuts: 'peanut', poha: 'puffed-rice-snack',
  'puffed rice': 'puffed-rice-snack', oats: 'oats', 'soya chunks': 'soya-beans', salt: 'salt', sugar: 'sugar',
  tea: 'tea', coffee: 'filter-coffee', oil: 'vegetable-oil', mustard: 'mustard', turmeric: 'turmeric-powder',
  'garam masala': 'spice-blends', 'sambar powder': 'spice-blends', cumin: 'spice-rack', tamarind: 'tamarind-pod',
  'yellow peas': 'lentils',
};

const PATTERNS: [RegExp, GroceryIcon][] = [
  [/\bdal\b|lentil/, 'lentils'],
  [/flour|atta|maida|besan|sooji|rava/, 'flour'],
  [/masala|powder/, 'spice-blends'],
  [/chil+i/, 'chili-pepper'],
  [/rice/, 'rice'],
  [/oil/, 'vegetable-oil'],
];

/** Icon for an ingredient name, or null when there's no good match. */
export function groceryIconFor(name: string): GroceryIcon | null {
  const key = ingredientKey(name);
  if (EXACT[key]) return EXACT[key];
  for (const [re, icon] of PATTERNS) if (re.test(key)) return icon;
  return null;
}
