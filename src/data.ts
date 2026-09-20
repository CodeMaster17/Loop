// Built-in meal library, recipe ideas, and ingredient shelf-life rules.
import type { LibMeal, Recipe } from './types';

// protein = grams per typical home serving. i = shopping ingredients.
export const LIB: LibMeal[] = [
  // Breakfast
  { t: 'breakfast', n: 'Moong Dal Chilla (2)', name: 'Moong Dal Chilla (2)', p: 16, v: true, i: ['moong dal', 'onion', 'coriander', 'green chili'] },
  { t: 'breakfast', n: 'Besan Chilla + curd', name: 'Besan Chilla + curd', p: 15, v: true, i: ['besan', 'curd', 'onion', 'tomato'] },
  { t: 'breakfast', n: 'Paneer Paratha + curd', name: 'Paneer Paratha + curd', p: 17, v: true, i: ['paneer', 'atta', 'curd', 'coriander'] },
  { t: 'breakfast', n: 'Poha with peanuts', name: 'Poha with peanuts', p: 8, v: true, i: ['poha', 'peanuts', 'onion', 'curry leaves'] },
  { t: 'breakfast', n: 'Vegetable Upma', name: 'Vegetable Upma', p: 8, v: true, i: ['sooji', 'onion', 'carrot', 'peas'] },
  { t: 'breakfast', n: 'Idli + Sambar (3)', name: 'Idli + Sambar (3)', p: 10, v: true, i: ['idli batter', 'toor dal', 'sambar powder', 'tomato'] },
  { t: 'breakfast', n: 'Masala Oats', name: 'Masala Oats', p: 10, v: true, i: ['oats', 'onion', 'tomato', 'peas'] },
  { t: 'breakfast', n: 'Sprouts Chaat bowl', name: 'Sprouts Chaat bowl', p: 14, v: true, i: ['moong sprouts', 'onion', 'tomato', 'lemon'] },
  { t: 'breakfast', n: 'Egg Bhurji + 2 Roti', name: 'Egg Bhurji + 2 Roti', p: 21, v: false, i: ['eggs', 'onion', 'tomato', 'atta'] },
  { t: 'breakfast', n: 'Boiled Eggs + Toast (3)', name: 'Boiled Eggs + Toast (3)', p: 20, v: false, i: ['eggs', 'bread', 'butter'] },
  // Lunch
  { t: 'lunch', n: 'Rajma Chawal + salad', name: 'Rajma Chawal + salad', p: 16, v: true, i: ['rajma', 'rice', 'onion', 'tomato', 'cucumber'] },
  { t: 'lunch', n: 'Chole + Rice', name: 'Chole + Rice', p: 15, v: true, i: ['chole', 'rice', 'onion', 'tomato'] },
  { t: 'lunch', n: 'Dal Tadka + 2 Roti + sabzi', name: 'Dal Tadka + 2 Roti + sabzi', p: 18, v: true, i: ['toor dal', 'atta', 'onion', 'mixed vegetables'] },
  { t: 'lunch', n: 'Paneer Bhurji + 2 Roti', name: 'Paneer Bhurji + 2 Roti', p: 23, v: true, i: ['paneer', 'atta', 'onion', 'capsicum'] },
  { t: 'lunch', n: 'Soya Chunk Curry + Rice', name: 'Soya Chunk Curry + Rice', p: 28, v: true, i: ['soya chunks', 'rice', 'onion', 'tomato'] },
  { t: 'lunch', n: 'Chana Dal + Rice', name: 'Chana Dal + Rice', p: 17, v: true, i: ['chana dal', 'rice', 'onion', 'ginger'] },
  { t: 'lunch', n: 'Kadhi + Rice', name: 'Kadhi + Rice', p: 11, v: true, i: ['besan', 'curd', 'rice', 'onion'] },
  { t: 'lunch', n: 'Chicken Curry + 2 Roti', name: 'Chicken Curry + 2 Roti', p: 34, v: false, i: ['chicken', 'atta', 'onion', 'tomato', 'curd'] },
  { t: 'lunch', n: 'Egg Curry + Rice', name: 'Egg Curry + Rice', p: 22, v: false, i: ['eggs', 'rice', 'onion', 'tomato'] },
  { t: 'lunch', n: 'Fish Curry + Rice', name: 'Fish Curry + Rice', p: 30, v: false, i: ['fish', 'rice', 'onion', 'tomato', 'coconut'] },
  // Dinner
  { t: 'dinner', n: 'Palak Paneer + 2 Roti', name: 'Palak Paneer + 2 Roti', p: 21, v: true, i: ['paneer', 'spinach', 'atta', 'onion'] },
  { t: 'dinner', n: 'Dal Makhani + Rice', name: 'Dal Makhani + Rice', p: 15, v: true, i: ['black dal', 'rajma', 'rice', 'butter'] },
  { t: 'dinner', n: 'Moong Dal Khichdi + curd', name: 'Moong Dal Khichdi + curd', p: 15, v: true, i: ['moong dal', 'rice', 'curd', 'ghee'] },
  { t: 'dinner', n: 'Tofu Bhurji + 2 Roti', name: 'Tofu Bhurji + 2 Roti', p: 22, v: true, i: ['tofu', 'atta', 'onion', 'capsicum'] },
  { t: 'dinner', n: 'Mix Veg + Dal + Roti', name: 'Mix Veg + Dal + Roti', p: 16, v: true, i: ['mixed vegetables', 'toor dal', 'atta'] },
  { t: 'dinner', n: 'Bhindi Masala + Dal + Roti', name: 'Bhindi Masala + Dal + Roti', p: 15, v: true, i: ['okra', 'toor dal', 'atta', 'onion'] },
  { t: 'dinner', n: 'Paneer Tikka + 2 Roti', name: 'Paneer Tikka + 2 Roti', p: 25, v: true, i: ['paneer', 'curd', 'capsicum', 'atta'] },
  { t: 'dinner', n: 'Veg Pulao + Raita', name: 'Veg Pulao + Raita', p: 11, v: true, i: ['rice', 'mixed vegetables', 'curd', 'peas'] },
  { t: 'dinner', n: 'Grilled Chicken + Salad', name: 'Grilled Chicken + Salad', p: 36, v: false, i: ['chicken', 'curd', 'cucumber', 'lemon'] },
  { t: 'dinner', n: 'Methi Chicken + 2 Roti', name: 'Methi Chicken + 2 Roti', p: 33, v: false, i: ['chicken', 'fenugreek', 'atta', 'onion'] },
];

export const SEED_RECS: Recipe[] = [
  { name: 'Soya Keema Matar', protein: 30, veg: true, why: 'Minced soya cooks like keema — huge protein, tastes rich.', items: ['soya granules', 'peas', 'onion', 'tomato'] },
  { name: 'Sprouts & Paneer Bhurji', protein: 26, veg: true, why: 'Double protein hit, ready in 15 minutes.', items: ['moong sprouts', 'paneer', 'onion', 'capsicum'] },
  { name: 'Dal Palak (high-protein dal)', protein: 18, veg: true, why: 'Iron + protein in one pot, great with rice.', items: ['toor dal', 'spinach', 'garlic', 'tomato'] },
  { name: 'Chicken Tikka (air-fry)', protein: 38, veg: false, why: 'Lean, no oil, meal-prep friendly.', items: ['chicken', 'curd', 'spices', 'lemon'] },
  { name: 'Rajma Galouti (protein patties)', protein: 22, veg: true, why: 'Kidney-bean kebabs — high fibre and protein.', items: ['rajma', 'onion', 'ginger', 'spices'] },
  { name: 'Egg & Veg Bhurji Wrap', protein: 24, veg: false, why: 'Roti wrap that travels well for lunch.', items: ['eggs', 'atta', 'capsicum', 'onion'] },
];

const FRESH = [
  'paneer', 'milk', 'curd', 'spinach', 'coriander', 'tomato', 'fenugreek', 'okra', 'mushroom',
  'chicken', 'fish', 'capsicum', 'mint', 'green chili', 'lemon', 'bread', 'moong sprouts', 'tofu',
  'cucumber', 'carrot', 'peas', 'curry leaves', 'coconut', 'mixed vegetables', 'cauliflower', 'cabbage',
];

/** 'fresh' = perishable (buy fresh, finishes fast); 'week' = staple (lasts the week). */
export function shelf(item: string): 'fresh' | 'week' {
  const s = item.toLowerCase();
  return FRESH.some((f) => s.indexOf(f) > -1) ? 'fresh' : 'week';
}
