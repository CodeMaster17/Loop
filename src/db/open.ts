// Opens the on-device database once, migrates it, and seeds it on first run.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { openDatabaseAsync } from 'expo-sqlite';
import type { Db } from './db';
import { migrate } from './migrations';
import { setAddedDishNames } from '../lib/rotation';
import { type LegacyData, seedIfEmpty } from './seed';

const DB_NAME = 'rasoi.db';
const LEGACY_KEY = 'rasoiPlanner.v1';

let opening: Promise<Db> | null = null;

async function readLegacy(): Promise<LegacyData> {
  const raw = await AsyncStorage.getItem(LEGACY_KEY);
  if (!raw) return {};
  const parsed = JSON.parse(raw) as LegacyData;
  return { prefs: parsed.prefs, settings: parsed.settings };
}

async function openAndPrepare(): Promise<Db> {
  const db: Db = await openDatabaseAsync(DB_NAME);
  await migrate(db);
  await seedIfEmpty(db, await readLegacy());
  const added = await db.getAllAsync<{ name: string }>('SELECT name FROM dishes WHERE active = 1');
  setAddedDishNames(added.map((r) => r.name));
  return db;
}

/** The shared database handle. Safe to call from many places. */
export function getDb(): Promise<Db> {
  if (!opening) {
    opening = openAndPrepare();
    opening.catch(() => { opening = null; });
  }
  return opening;
}
