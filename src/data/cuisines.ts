// Onboarding content: cuisines, regions, dishes (per meal slot), and kitchen items.
import type { OnbSlot } from '../types';

export interface Cuisine {
  id: string;
  label: string;
  emoji: string;
  regionIds: string[];
}

export interface Region {
  id: string;
  label: string;
  cuisineId: string;
}

export interface OnbDish {
  name: string;
  slot: OnbSlot;
  /** which cuisines this dish belongs to */
  cuisines: string[];
  veg: boolean;
  /** protein grams per serving */
  p: number;
  /** shopping ingredients (lowercase) */
  i: string[];
}

export interface KitchenItem {
  name: string;
  category: 'staple' | 'perishable';
}

export const CUISINES: Cuisine[] = [
  { id: 'north-indian', label: 'North Indian', emoji: '🫓', regionIds: ['uttar-pradesh'] },
  { id: 'south-indian', label: 'South Indian', emoji: '🥥', regionIds: ['karnataka', 'tamil-nadu'] },
  { id: 'north-eastern', label: 'North Eastern', emoji: '🍲', regionIds: ['odisha'] },
];

export const REGIONS: Region[] = [
  { id: 'uttar-pradesh', label: 'Uttar Pradesh', cuisineId: 'north-indian' },
  { id: 'karnataka', label: 'Karnataka', cuisineId: 'south-indian' },
  { id: 'tamil-nadu', label: 'Tamil Nadu', cuisineId: 'south-indian' },
  { id: 'odisha', label: 'Odisha', cuisineId: 'north-eastern' },
];

export const MEAL_TABS: { slot: OnbSlot; label: string; emoji: string }[] = [
  { slot: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { slot: 'lunch', label: 'Lunch', emoji: '🍛' },
  { slot: 'snacks', label: 'Evening Snacks', emoji: '☕' },
  { slot: 'dinner', label: 'Dinner', emoji: '🌙' },
];

const N = ['north-indian'];
const S = ['south-indian'];
const E = ['north-eastern'];

export const DISHES: OnbDish[] = [
  // ---------- North Indian ----------
  { name: 'Aloo Paratha + curd', slot: 'breakfast', cuisines: N, veg: true, p: 11, i: ['atta', 'potato', 'curd'] },
  { name: 'Paneer Paratha', slot: 'breakfast', cuisines: N, veg: true, p: 17, i: ['paneer', 'atta', 'curd'] },
  { name: 'Poha', slot: 'breakfast', cuisines: N, veg: true, p: 8, i: ['poha', 'onion', 'peanuts'] },
  { name: 'Besan Chilla', slot: 'breakfast', cuisines: N, veg: true, p: 15, i: ['besan', 'onion', 'tomato'] },
  { name: 'Bedmi Puri + Aloo Sabzi', slot: 'breakfast', cuisines: N, veg: true, p: 10, i: ['atta', 'urad dal', 'potato'] },
  { name: 'Rajma Chawal', slot: 'lunch', cuisines: N, veg: true, p: 16, i: ['rajma', 'rice', 'onion', 'tomato'] },
  { name: 'Kadhi Chawal', slot: 'lunch', cuisines: N, veg: true, p: 11, i: ['besan', 'curd', 'rice'] },
  { name: 'Dal Tadka + 2 Roti', slot: 'lunch', cuisines: N, veg: true, p: 18, i: ['toor dal', 'atta', 'onion'] },
  { name: 'Chole + Rice', slot: 'lunch', cuisines: N, veg: true, p: 15, i: ['chole', 'rice', 'onion', 'tomato'] },
  { name: 'Aloo Gobi + 2 Roti', slot: 'lunch', cuisines: N, veg: true, p: 10, i: ['potato', 'cauliflower', 'atta'] },
  { name: 'Samosa (2)', slot: 'snacks', cuisines: N, veg: true, p: 6, i: ['atta', 'potato', 'peas'] },
  { name: 'Pakora', slot: 'snacks', cuisines: N, veg: true, p: 8, i: ['besan', 'onion', 'potato'] },
  { name: 'Aloo Tikki', slot: 'snacks', cuisines: N, veg: true, p: 6, i: ['potato', 'peas', 'coriander'] },
  { name: 'Bread Pakora', slot: 'snacks', cuisines: N, veg: true, p: 9, i: ['bread', 'besan', 'potato'] },
  { name: 'Masala Chai + Rusk', slot: 'snacks', cuisines: N, veg: true, p: 5, i: ['milk', 'tea', 'sugar'] },
  { name: 'Palak Paneer + 2 Roti', slot: 'dinner', cuisines: N, veg: true, p: 21, i: ['paneer', 'spinach', 'atta'] },
  { name: 'Dal Makhani + Rice', slot: 'dinner', cuisines: N, veg: true, p: 15, i: ['black dal', 'rajma', 'rice', 'butter'] },
  { name: 'Mix Veg + 2 Roti', slot: 'dinner', cuisines: N, veg: true, p: 12, i: ['mixed vegetables', 'atta', 'onion'] },
  { name: 'Paneer Butter Masala + Roti', slot: 'dinner', cuisines: N, veg: true, p: 22, i: ['paneer', 'tomato', 'butter', 'atta'] },
  { name: 'Baingan Bharta + 2 Roti', slot: 'dinner', cuisines: N, veg: true, p: 10, i: ['brinjal', 'onion', 'atta'] },

  // ---------- South Indian ----------
  { name: 'Idli + Sambar (3)', slot: 'breakfast', cuisines: S, veg: true, p: 10, i: ['idli batter', 'toor dal', 'sambar powder'] },
  { name: 'Masala Dosa', slot: 'breakfast', cuisines: S, veg: true, p: 9, i: ['dosa batter', 'potato', 'onion'] },
  { name: 'Upma', slot: 'breakfast', cuisines: S, veg: true, p: 8, i: ['sooji', 'onion', 'carrot'] },
  { name: 'Ven Pongal', slot: 'breakfast', cuisines: S, veg: true, p: 12, i: ['rice', 'moong dal', 'ghee'] },
  { name: 'Medu Vada + Sambar', slot: 'breakfast', cuisines: S, veg: true, p: 13, i: ['urad dal', 'toor dal', 'curry leaves'] },
  { name: 'Sambar Rice', slot: 'lunch', cuisines: S, veg: true, p: 14, i: ['rice', 'toor dal', 'mixed vegetables'] },
  { name: 'Curd Rice', slot: 'lunch', cuisines: S, veg: true, p: 9, i: ['rice', 'curd', 'curry leaves'] },
  { name: 'Rasam Rice', slot: 'lunch', cuisines: S, veg: true, p: 9, i: ['rice', 'toor dal', 'tomato'] },
  { name: 'Bisi Bele Bath', slot: 'lunch', cuisines: S, veg: true, p: 13, i: ['rice', 'toor dal', 'mixed vegetables'] },
  { name: 'Lemon Rice', slot: 'lunch', cuisines: S, veg: true, p: 7, i: ['rice', 'lemon', 'peanuts'] },
  { name: 'Mysore Bonda', slot: 'snacks', cuisines: S, veg: true, p: 6, i: ['maida', 'curd', 'coconut'] },
  { name: 'Banana Bhajji', slot: 'snacks', cuisines: S, veg: true, p: 5, i: ['raw banana', 'besan'] },
  { name: 'Murukku', slot: 'snacks', cuisines: S, veg: true, p: 5, i: ['rice flour', 'urad dal'] },
  { name: 'Masala Vada', slot: 'snacks', cuisines: S, veg: true, p: 11, i: ['chana dal', 'onion', 'curry leaves'] },
  { name: 'Filter Coffee + Biscuit', slot: 'snacks', cuisines: S, veg: true, p: 4, i: ['milk', 'coffee', 'sugar'] },
  { name: 'Ragi Mudde + Saaru', slot: 'dinner', cuisines: S, veg: true, p: 12, i: ['ragi flour', 'toor dal', 'tomato'] },
  { name: 'Set Dosa + Chutney', slot: 'dinner', cuisines: S, veg: true, p: 9, i: ['dosa batter', 'coconut', 'coriander'] },
  { name: 'Uttapam', slot: 'dinner', cuisines: S, veg: true, p: 10, i: ['dosa batter', 'onion', 'tomato'] },
  { name: 'Adai + Avial', slot: 'dinner', cuisines: S, veg: true, p: 16, i: ['mixed dal', 'mixed vegetables', 'coconut'] },
  { name: 'Tomato Rice', slot: 'dinner', cuisines: S, veg: true, p: 8, i: ['rice', 'tomato', 'onion'] },

  // ---------- North Eastern / Odisha ----------
  { name: 'Chuda (Poha) + curd', slot: 'breakfast', cuisines: E, veg: true, p: 8, i: ['flattened rice', 'curd', 'sugar'] },
  { name: 'Ghugni', slot: 'breakfast', cuisines: E, veg: true, p: 14, i: ['yellow peas', 'onion', 'tomato'] },
  { name: 'Suji Upma', slot: 'breakfast', cuisines: E, veg: true, p: 8, i: ['sooji', 'onion', 'peas'] },
  { name: 'Aloo Chop + Muri', slot: 'breakfast', cuisines: E, veg: true, p: 7, i: ['potato', 'besan', 'puffed rice'] },
  { name: 'Chhena Poda slice + tea', slot: 'breakfast', cuisines: E, veg: true, p: 9, i: ['chhena', 'sugar', 'milk'] },
  { name: 'Dalma + Rice', slot: 'lunch', cuisines: E, veg: true, p: 16, i: ['toor dal', 'mixed vegetables', 'rice'] },
  { name: 'Pakhala Bhata + Aloo Bharta', slot: 'lunch', cuisines: E, veg: true, p: 9, i: ['rice', 'curd', 'potato'] },
  { name: 'Machha Besara + Rice', slot: 'lunch', cuisines: E, veg: false, p: 28, i: ['fish', 'mustard', 'rice'] },
  { name: 'Santula + Rice', slot: 'lunch', cuisines: E, veg: true, p: 10, i: ['mixed vegetables', 'rice', 'garlic'] },
  { name: 'Chhena Tarkari + Rice', slot: 'lunch', cuisines: E, veg: true, p: 18, i: ['chhena', 'tomato', 'rice'] },
  { name: 'Bara (2)', slot: 'snacks', cuisines: E, veg: true, p: 10, i: ['urad dal', 'onion'] },
  { name: 'Piaji (onion fritter)', slot: 'snacks', cuisines: E, veg: true, p: 7, i: ['besan', 'onion'] },
  { name: 'Gupchup (Pani Puri)', slot: 'snacks', cuisines: E, veg: true, p: 5, i: ['semolina', 'potato', 'tamarind'] },
  { name: 'Dahi Bara Aloo Dum', slot: 'snacks', cuisines: E, veg: true, p: 12, i: ['urad dal', 'curd', 'potato'] },
  { name: 'Muri Mixture', slot: 'snacks', cuisines: E, veg: true, p: 6, i: ['puffed rice', 'peanuts', 'onion'] },
  { name: 'Dalma + Rice', slot: 'dinner', cuisines: E, veg: true, p: 16, i: ['toor dal', 'mixed vegetables', 'rice'] },
  { name: 'Macha Jhola + Rice', slot: 'dinner', cuisines: E, veg: false, p: 27, i: ['fish', 'onion', 'rice'] },
  { name: 'Saga Bhaja + Dal + Rice', slot: 'dinner', cuisines: E, veg: true, p: 13, i: ['spinach', 'toor dal', 'rice'] },
  { name: 'Besara Mixed Veg + Roti', slot: 'dinner', cuisines: E, veg: true, p: 11, i: ['mixed vegetables', 'mustard', 'atta'] },
  { name: 'Chhena Tarkari + Roti', slot: 'dinner', cuisines: E, veg: true, p: 18, i: ['chhena', 'tomato', 'atta'] },
];

export const KITCHEN: KitchenItem[] = [
  // staples (assumed present — pre-checked)
  { name: 'Salt', category: 'staple' },
  { name: 'Turmeric (Haldi)', category: 'staple' },
  { name: 'Red Chilli Powder', category: 'staple' },
  { name: 'Cumin (Jeera)', category: 'staple' },
  { name: 'Mustard Seeds', category: 'staple' },
  { name: 'Garam Masala', category: 'staple' },
  { name: 'Cooking Oil', category: 'staple' },
  { name: 'Ghee', category: 'staple' },
  { name: 'Rice', category: 'staple' },
  { name: 'Wheat Flour (Atta)', category: 'staple' },
  { name: 'Toor Dal', category: 'staple' },
  { name: 'Sugar', category: 'staple' },
  { name: 'Tea', category: 'staple' },
  { name: 'Onion', category: 'staple' },
  { name: 'Potato', category: 'staple' },
  { name: 'Garlic', category: 'staple' },
  { name: 'Ginger', category: 'staple' },
  // perishables (buy fresh — unchecked by default)
  { name: 'Milk', category: 'perishable' },
  { name: 'Curd', category: 'perishable' },
  { name: 'Paneer', category: 'perishable' },
  { name: 'Tomato', category: 'perishable' },
  { name: 'Coriander', category: 'perishable' },
  { name: 'Green Chilli', category: 'perishable' },
  { name: 'Spinach', category: 'perishable' },
  { name: 'Mixed Vegetables', category: 'perishable' },
  { name: 'Eggs', category: 'perishable' },
  { name: 'Bread', category: 'perishable' },
  { name: 'Lemon', category: 'perishable' },
];

/** Dishes for a slot, filtered to the chosen cuisines (falls back to all if none chosen). */
export function dishesFor(slot: OnbSlot, cuisineIds: string[]): OnbDish[] {
  return DISHES.filter((d) => d.slot === slot && (cuisineIds.length === 0 || d.cuisines.some((c) => cuisineIds.includes(c))));
}
