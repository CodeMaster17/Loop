// Meal library, shelf-life rules, and plan helpers for Rasoi Planner.

// protein = grams per typical home serving. items = shopping ingredients.
export const LIB = [
  // Breakfast
  { t: 'breakfast', n: 'Moong Dal Chilla (2)', p: 16, v: true, i: ['moong dal', 'onion', 'coriander', 'green chili'] },
  { t: 'breakfast', n: 'Besan Chilla + curd', p: 15, v: true, i: ['besan', 'curd', 'onion', 'tomato'] },
  { t: 'breakfast', n: 'Paneer Paratha + curd', p: 17, v: true, i: ['paneer', 'atta', 'curd', 'coriander'] },
  { t: 'breakfast', n: 'Poha with peanuts', p: 8, v: true, i: ['poha', 'peanuts', 'onion', 'curry leaves'] },
  { t: 'breakfast', n: 'Vegetable Upma', p: 8, v: true, i: ['sooji', 'onion', 'carrot', 'peas'] },
  { t: 'breakfast', n: 'Idli + Sambar (3)', p: 10, v: true, i: ['idli batter', 'toor dal', 'sambar powder', 'tomato'] },
  { t: 'breakfast', n: 'Masala Oats', p: 10, v: true, i: ['oats', 'onion', 'tomato', 'peas'] },
  { t: 'breakfast', n: 'Sprouts Chaat bowl', p: 14, v: true, i: ['moong sprouts', 'onion', 'tomato', 'lemon'] },
  { t: 'breakfast', n: 'Egg Bhurji + 2 Roti', p: 21, v: false, i: ['eggs', 'onion', 'tomato', 'atta'] },
  { t: 'breakfast', n: 'Boiled Eggs + Toast (3)', p: 20, v: false, i: ['eggs', 'bread', 'butter'] },
  // Lunch
  { t: 'lunch', n: 'Rajma Chawal + salad', p: 16, v: true, i: ['rajma', 'rice', 'onion', 'tomato', 'cucumber'] },
  { t: 'lunch', n: 'Chole + Rice', p: 15, v: true, i: ['chole', 'rice', 'onion', 'tomato'] },
  { t: 'lunch', n: 'Dal Tadka + 2 Roti + sabzi', p: 18, v: true, i: ['toor dal', 'atta', 'onion', 'mixed vegetables'] },
  { t: 'lunch', n: 'Paneer Bhurji + 2 Roti', p: 23, v: true, i: ['paneer', 'atta', 'onion', 'capsicum'] },
  { t: 'lunch', n: 'Soya Chunk Curry + Rice', p: 28, v: true, i: ['soya chunks', 'rice', 'onion', 'tomato'] },
  { t: 'lunch', n: 'Chana Dal + Rice', p: 17, v: true, i: ['chana dal', 'rice', 'onion', 'ginger'] },
  { t: 'lunch', n: 'Kadhi + Rice', p: 11, v: true, i: ['besan', 'curd', 'rice', 'onion'] },
  { t: 'lunch', n: 'Chicken Curry + 2 Roti', p: 34, v: false, i: ['chicken', 'atta', 'onion', 'tomato', 'curd'] },
  { t: 'lunch', n: 'Egg Curry + Rice', p: 22, v: false, i: ['eggs', 'rice', 'onion', 'tomato'] },
  { t: 'lunch', n: 'Fish Curry + Rice', p: 30, v: false, i: ['fish', 'rice', 'onion', 'tomato', 'coconut'] },
  // Dinner
  { t: 'dinner', n: 'Palak Paneer + 2 Roti', p: 21, v: true, i: ['paneer', 'spinach', 'atta', 'onion'] },
  { t: 'dinner', n: 'Dal Makhani + Rice', p: 15, v: true, i: ['black dal', 'rajma', 'rice', 'butter'] },
  { t: 'dinner', n: 'Moong Dal Khichdi + curd', p: 15, v: true, i: ['moong dal', 'rice', 'curd', 'ghee'] },
  { t: 'dinner', n: 'Tofu Bhurji + 2 Roti', p: 22, v: true, i: ['tofu', 'atta', 'onion', 'capsicum'] },
  { t: 'dinner', n: 'Mix Veg + Dal + Roti', p: 16, v: true, i: ['mixed vegetables', 'toor dal', 'atta'] },
  { t: 'dinner', n: 'Bhindi Masala + Dal + Roti', p: 15, v: true, i: ['okra', 'toor dal', 'atta', 'onion'] },
  { t: 'dinner', n: 'Paneer Tikka + 2 Roti', p: 25, v: true, i: ['paneer', 'curd', 'capsicum', 'atta'] },
  { t: 'dinner', n: 'Veg Pulao + Raita', p: 11, v: true, i: ['rice', 'mixed vegetables', 'curd', 'peas'] },
  { t: 'dinner', n: 'Grilled Chicken + Salad', p: 36, v: false, i: ['chicken', 'curd', 'cucumber', 'lemon'] },
  { t: 'dinner', n: 'Methi Chicken + 2 Roti', p: 33, v: false, i: ['chicken', 'fenugreek', 'atta', 'onion'] },
];

export const SEED_RECS = [
  { name: 'Soya Keema Matar', protein: 30, veg: true, why: 'Minced soya cooks like keema — huge protein, tastes rich.', items: ['soya granules', 'peas', 'onion', 'tomato'] },
  { name: 'Sprouts & Paneer Bhurji', protein: 26, veg: true, why: 'Double protein hit, ready in 15 minutes.', items: ['moong sprouts', 'paneer', 'onion', 'capsicum'] },
  { name: 'Dal Palak (high-protein dal)', protein: 18, veg: true, why: 'Iron + protein in one pot, great with rice.', items: ['toor dal', 'spinach', 'garlic', 'tomato'] },
  { name: 'Chicken Tikka (air-fry)', protein: 38, veg: false, why: 'Lean, no oil, meal-prep friendly.', items: ['chicken', 'curd', 'spices', 'lemon'] },
  { name: 'Rajma Galouti (protein patties)', protein: 22, veg: true, why: 'Kidney-bean kebabs — high fibre and protein.', items: ['rajma', 'onion', 'ginger', 'spices'] },
  { name: 'Egg & Veg Bhurji Wrap', protein: 24, veg: false, why: 'Roti wrap that travels well for lunch.', items: ['eggs', 'atta', 'capsicum', 'onion'] },
];

const FRESH = ['paneer', 'milk', 'curd', 'spinach', 'coriander', 'tomato', 'fenugreek', 'okra', 'mushroom',
  'chicken', 'fish', 'capsicum', 'mint', 'green chili', 'lemon', 'bread', 'moong sprouts', 'tofu',
  'cucumber', 'carrot', 'peas', 'curry leaves', 'coconut', 'mixed vegetables', 'cauliflower', 'cabbage'];

export function shelf(item) {
  const s = String(item).toLowerCase();
  for (let i = 0; i < FRESH.length; i++) if (s.indexOf(FRESH[i]) > -1) return 'fresh';
  return 'week';
}

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function dkey(d) {
  // local YYYY-MM-DD (avoid UTC shift from toISOString)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}
export function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

export function prettyDate(d) {
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const x = new Date(d); x.setHours(0, 0, 0, 0);
  const diff = Math.round((x - t) / 86400000);
  const rel = diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : diff === -1 ? 'Yesterday' : DAYS[x.getDay()];
  const sub = x.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  return { rel, sub };
}

export function pick(type, diet, avoid) {
  const pool = LIB.filter((m) => {
    if (m.t !== type) return false;
    if (diet === 'veg' && !m.v) return false;
    if (diet === 'nonveg' && m.v && Math.random() > 0.35) return false;
    return true;
  });
  const avoidList = avoid || [];
  const fresh = pool.filter((m) => avoidList.indexOf(m.n) < 0);
  const use = fresh.length ? fresh : pool;
  const m = use[Math.floor(Math.random() * use.length)] || pool[0];
  return { name: m.n, p: m.p, v: m.v, i: m.i.slice() };
}

export function seedDay(diet, avoid) {
  return {
    breakfast: pick('breakfast', diet, avoid),
    lunch: pick('lunch', diet, avoid),
    dinner: pick('dinner', diet, avoid),
  };
}

export function recentNames(plan) {
  const out = [];
  Object.keys(plan || {}).forEach((k) => {
    const d = plan[k];
    ['breakfast', 'lunch', 'dinner'].forEach((s) => { if (d[s]) out.push(d[s].name); });
  });
  return out;
}

export function dayProtein(d) {
  if (!d) return 0;
  return (d.breakfast?.p || 0) + (d.lunch?.p || 0) + (d.dinner?.p || 0);
}

// Aggregate this week's ingredients into a shopping map { item: count }.
export function weekIngredients(plan) {
  const today = new Date();
  const map = {};
  for (let i = 0; i < 7; i++) {
    const day = plan[dkey(addDays(today, i))];
    if (!day) continue;
    ['breakfast', 'lunch', 'dinner'].forEach((s) => {
      (day[s].i || []).forEach((it) => {
        const key = String(it).toLowerCase().trim();
        map[key] = (map[key] || 0) + 1;
      });
    });
  }
  return map;
}

// Keyword command parser for voice/typed edits. Mutates `day`, returns true if applied.
export function applyCommand(cmd, day, diet) {
  const c = String(cmd).toLowerCase();
  if (/veg day|make it veg|all veg|pure veg/.test(c)) {
    const fresh = seedDay('veg', []);
    day.breakfast = fresh.breakfast; day.lunch = fresh.lunch; day.dinner = fresh.dinner;
    return true;
  }
  const slot = /breakfast|nashta|subah|morning/.test(c) ? 'breakfast'
    : /lunch|dopahar|afternoon/.test(c) ? 'lunch'
    : /dinner|raat|night|evening/.test(c) ? 'dinner' : null;
  if (!slot) return false;

  const mt = c.match(/(?:to|banao|banana|kar do|for|as)\s+(.+)$/);
  if (mt) {
    const raw = mt[1].trim();
    const word = raw.split(' ')[0];
    const found = LIB.filter((m) => m.n.toLowerCase().indexOf(word) > -1)[0];
    day[slot] = found
      ? { name: found.n, p: found.p, v: found.v, i: found.i.slice() }
      : { name: raw.replace(/\b\w/g, (x) => x.toUpperCase()), p: 15, v: true, i: [] };
    return true;
  }
  if (/high protein|zyada protein|more protein|protein/.test(c)) {
    day[slot] = pick(slot, 'both', [day[slot].name]);
    if (day[slot].p < 20) day[slot].p += 8;
    return true;
  }
  // just "change dinner" -> reshuffle that slot
  day[slot] = pick(slot, diet, [day[slot].name]);
  return true;
}

// Build the WhatsApp menu message for a day.
export function buildMenuMessage(plan, key, settings) {
  const d = plan[key];
  const pd = prettyDate(new Date(key));
  const when = pd.rel + ' (' + pd.sub + ')';
  const name = settings.cookName ? ' ' + settings.cookName : '';
  if (settings.lang === 'hinglish') {
    return 'Namaste' + name + ' 🙏 ' + when + ' ka menu:\n\n' +
      '🌅 Nashta: ' + d.breakfast.name + '\n' +
      '🍛 Lunch: ' + d.lunch.name + '\n' +
      '🌙 Raat ka khana: ' + d.dinner.name + '\n\nDhanyavaad!';
  }
  return 'Hi' + name + ' 🙏 Menu for ' + when + ':\n\n' +
    '🌅 Breakfast: ' + d.breakfast.name + '\n' +
    '🍛 Lunch: ' + d.lunch.name + '\n' +
    '🌙 Dinner: ' + d.dinner.name + '\n\nThank you!';
}

export function buildGroceryMessage(plan, done) {
  const map = weekIngredients(plan);
  const fresh = [], week = [];
  Object.keys(map).forEach((it) => { if (!done[it]) (shelf(it) === 'fresh' ? fresh : week).push(it); });
  const cap = (a) => a.map((x) => '• ' + x.replace(/\b\w/g, (c) => c.toUpperCase())).join('\n');
  return '🛒 Grocery list for the week:\n\n🥬 Buy fresh:\n' + (cap(fresh) || '—') +
    '\n\n🫙 Staples to check:\n' + (cap(week) || '—');
}
