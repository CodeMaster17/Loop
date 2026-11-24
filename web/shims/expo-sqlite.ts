// Web stand-in for expo-sqlite: the same SQLite engine (sql.js, WebAssembly) with the
// database file kept in IndexedDB. src/db/open.ts runs unchanged on top of it, so the
// migrations (v1-v4), seed, no-fish rule and ADD semantics are exactly the native ones.
import initSqlJs from 'sql.js';
import { loadFile, saveFile } from '../client/db/idbFile';
import { type SqlJsDb, wrapSqlJs } from '../client/db/sqljsDb';

const SAVE_DELAY_MS = 250;

export async function openDatabaseAsync(name: string): Promise<SqlJsDb> {
  const SQL = await initSqlJs({ locateFile: () => '/sql-wasm.wasm', useOldExtensionFunctions: false });
  const saved = await loadFile(name);
  const raw = new SQL.Database(saved ?? undefined);

  let timer: ReturnType<typeof setTimeout> | null = null;
  const flush = () => {
    if (timer) { clearTimeout(timer); timer = null; }
    if (db.inTransaction()) { schedule(); return; }
    saveFile(name, db.snapshot()).catch((e: unknown) => console.error('[rasoi] could not save the database', e));
  };
  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, SAVE_DELAY_MS);
  };
  const db = wrapSqlJs(raw, schedule);

  // Save straight away when the app goes to the background or closes.
  const flushIfPending = () => { if (timer) flush(); };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushIfPending(); });
  window.addEventListener('pagehide', flushIfPending);
  return db;
}
