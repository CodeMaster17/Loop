// Numbered schema migrations, tracked with SQLite's PRAGMA user_version.
// Never edit a shipped migration — add a new one at the end.
import type { Db } from './db';

const V1 = `
CREATE TABLE dishes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  slots INTEGER NOT NULL,              -- bitmask: 1 breakfast, 2 lunch, 4 dinner, 8 snacks
  veg INTEGER NOT NULL DEFAULT 1,
  protein_g REAL NOT NULL DEFAULT 0,   -- per serving
  cook_note TEXT,
  soak INTEGER NOT NULL DEFAULT 0,
  soak_note TEXT,
  soak_hours REAL,
  youtube_url TEXT,
  youtube_id TEXT,
  youtube_title TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  buy_mode TEXT NOT NULL CHECK (buy_mode IN ('bulk', 'weekly')),
  unit TEXT,
  pack_size REAL,
  category TEXT,
  search_term TEXT,
  deleted INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE dish_ingredients (
  dish_id INTEGER NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  ingredient_id INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  qty_per_serving REAL,
  unit TEXT,
  PRIMARY KEY (dish_id, ingredient_id)
);

CREATE TABLE pantry (
  ingredient_id INTEGER PRIMARY KEY REFERENCES ingredients(id) ON DELETE CASCADE,
  level TEXT CHECK (level IN ('ok', 'low', 'out')),  -- bulk items
  qty_on_hand REAL,                                  -- weekly items, optional
  last_bought_on TEXT,
  typical_days INTEGER
);

CREATE TABLE week_menus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_start TEXT NOT NULL UNIQUE,
  seed INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'final')),
  generated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE menu_entries (
  week_id INTEGER NOT NULL REFERENCES week_menus(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  slot TEXT NOT NULL CHECK (slot IN ('breakfast', 'lunch', 'dinner')),
  dish_id INTEGER REFERENCES dishes(id) ON DELETE SET NULL,
  alt1_dish_id INTEGER REFERENCES dishes(id) ON DELETE SET NULL,
  alt2_dish_id INTEGER REFERENCES dishes(id) ON DELETE SET NULL,
  locked INTEGER NOT NULL DEFAULT 0,
  servings REAL NOT NULL DEFAULT 1,
  eaten INTEGER,
  PRIMARY KEY (date, slot)
);

CREATE TABLE cook (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL DEFAULT '',
  phone_e164 TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'english' CHECK (language IN ('english', 'hinglish', 'hindi'))
);

CREATE TABLE schedules (
  kind TEXT PRIMARY KEY CHECK (kind IN ('next_day', 'dinner_today', 'soak', 'grocery')),
  time_hhmm TEXT NOT NULL,
  weekday INTEGER,                      -- 0 Sun .. 6 Sat; only for grocery
  enabled INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE message_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,
  for_date TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'opened', 'sent', 'skipped')),
  at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE shopping_lists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_start TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'done'))
);

CREATE TABLE shopping_items (
  list_id INTEGER NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  ingredient_id INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  qty REAL,
  unit TEXT,
  reason TEXT NOT NULL CHECK (reason IN ('menu', 'bulk_low', 'check')),
  checked INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (list_id, ingredient_id)
);

CREATE TABLE settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  protein_target_g REAL NOT NULL DEFAULT 60,
  cook_days TEXT NOT NULL DEFAULT '1,2,3,4,5,6',   -- JS getDay(): Mon..Sat
  cooldown_days INTEGER NOT NULL DEFAULT 7,
  servings_default REAL NOT NULL DEFAULT 1
);

INSERT INTO cook (id) VALUES (1);
INSERT INTO settings (id) VALUES (1);
INSERT INTO schedules (kind, time_hhmm, weekday) VALUES
  ('next_day', '21:30', NULL),
  ('dinner_today', '17:30', NULL),
  ('soak', '21:00', NULL),
  ('grocery', '20:00', 5);
`;

// v2: one photo per dish (auto-picked from Unsplash), with the credit Unsplash requires.
const V2 = `
ALTER TABLE dishes ADD COLUMN photo_id TEXT;
ALTER TABLE dishes ADD COLUMN photo_url TEXT;
ALTER TABLE dishes ADD COLUMN photo_thumb_url TEXT;
ALTER TABLE dishes ADD COLUMN photo_author TEXT;
ALTER TABLE dishes ADD COLUMN photo_author_url TEXT;
ALTER TABLE dishes ADD COLUMN photo_page_url TEXT;
ALTER TABLE dishes ADD COLUMN photo_source TEXT;
ALTER TABLE dishes ADD COLUMN photo_checked_at TEXT;
`;

// v3: keep every dish on the menu card, but take fish/seafood and a few snacks out of the
// weekly rotation; remember rejected photos so a wrong one is never picked again
// (Rajma Chawal's first auto-picked photo was wrong).
const V3 = `
ALTER TABLE dishes ADD COLUMN photo_rejected TEXT;

UPDATE dishes SET active = 0
WHERE id IN (
  SELECT di.dish_id FROM dish_ingredients di JOIN ingredients i ON i.id = di.ingredient_id
  WHERE i.key IN ('fish', 'prawn', 'prawns', 'shrimp', 'crab', 'seafood')
)
OR lower(name) LIKE '%fish%' OR lower(name) LIKE 'macha %' OR lower(name) LIKE 'machha %'
OR lower(name) LIKE '%prawn%' OR lower(name) LIKE '%jhinga%'
OR name IN ('Samosa (2)', 'Aloo Tikki', 'Mysore Bonda');

UPDATE dishes
SET photo_rejected = CASE WHEN photo_rejected IS NULL OR photo_rejected = '' THEN photo_id ELSE photo_rejected || ',' || photo_id END,
    photo_id = NULL, photo_url = NULL, photo_thumb_url = NULL, photo_author = NULL,
    photo_author_url = NULL, photo_page_url = NULL, photo_source = NULL, photo_checked_at = NULL
WHERE lower(name) LIKE 'rajma chawal%' AND photo_id IS NOT NULL;
`;

// v4: ADD / ADDED means "I chose this dish". Everything starts un-added; the planner uses
// only added dishes once you add some (and every dish until then).
const V4 = `UPDATE dishes SET active = 0;`;

export const MIGRATIONS: string[] = [V1, V2, V3, V4];

/** Bring the database up to the latest schema. Returns the resulting version. */
export async function migrate(db: Db): Promise<number> {
  await db.execAsync('PRAGMA foreign_keys = ON;');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  while (version < MIGRATIONS.length) {
    const sql = MIGRATIONS[version];
    const next = version + 1;
    await db.withTransactionAsync(async () => {
      await db.execAsync(sql);
      await db.execAsync(`PRAGMA user_version = ${next}`);
    });
    version = next;
  }
  return version;
}
