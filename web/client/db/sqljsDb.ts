// The app's Db interface (src/db/db.ts) on top of sql.js, SQLite compiled to WebAssembly.
// The whole database lives in memory; `onWrite` is called after every change so the
// caller can save a snapshot (see idbFile.ts). Kept free of browser APIs so it runs in tests.
import type { Database, SqlValue } from 'sql.js';
import type { Db, SqlParam } from '../../shared/src/db/db';

export interface SqlJsDb extends Db {
  /** A copy of the database file, for saving. */
  snapshot(): Uint8Array;
  /** True while a withTransactionAsync task is running (don't snapshot then). */
  inTransaction(): boolean;
}

export function wrapSqlJs(db: Database, onWrite: () => void = () => {}): SqlJsDb {
  let inTx = false;

  const all = <T>(sql: string, params: SqlParam[]): T[] => {
    const stmt = db.prepare(sql);
    try {
      stmt.bind(params as SqlValue[]);
      const rows: T[] = [];
      while (stmt.step()) rows.push(stmt.getAsObject() as T);
      return rows;
    } finally {
      stmt.free();
    }
  };

  return {
    async execAsync(sql) {
      db.exec(sql);
      onWrite();
    },
    async runAsync(sql, ...params) {
      db.run(sql, params as SqlValue[]);
      const changes = db.getRowsModified();
      const id = db.exec('SELECT last_insert_rowid() AS id')[0]?.values[0]?.[0];
      onWrite();
      return { lastInsertRowId: Number(id ?? 0), changes };
    },
    async getAllAsync<T>(sql: string, ...params: SqlParam[]) {
      return all<T>(sql, params);
    },
    async getFirstAsync<T>(sql: string, ...params: SqlParam[]) {
      return all<T>(sql, params)[0] ?? null;
    },
    async withTransactionAsync(task) {
      db.exec('BEGIN');
      inTx = true;
      try {
        await task();
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      } finally {
        inTx = false;
      }
      onWrite();
    },
    snapshot() {
      // sql.js closes and reopens the connection to export, which resets per-connection
      // settings; turn foreign keys back on like migrate() does.
      const bytes = db.export();
      db.exec('PRAGMA foreign_keys = ON;');
      return bytes;
    },
    inTransaction: () => inTx,
  };
}
