/// <reference types="node" />
// Test-only: the app's Db interface backed by Node's built-in SQLite (node:sqlite),
// so migrations and repositories run against a real SQLite engine in Jest.
import { DatabaseSync } from 'node:sqlite';
import type { Db, SqlParam } from '../src/db/db';

export function openTestDb(): Db & { close: () => void } {
  const db = new DatabaseSync(':memory:');
  return {
    async execAsync(sql) { db.exec(sql); },
    async runAsync(sql, ...params: SqlParam[]) {
      const r = db.prepare(sql).run(...params);
      return { lastInsertRowId: Number(r.lastInsertRowid), changes: Number(r.changes) };
    },
    async getAllAsync<T>(sql: string, ...params: SqlParam[]) {
      return db.prepare(sql).all(...params) as T[];
    },
    async getFirstAsync<T>(sql: string, ...params: SqlParam[]) {
      return (db.prepare(sql).get(...params) as T | undefined) ?? null;
    },
    async withTransactionAsync(task) {
      db.exec('BEGIN');
      try {
        await task();
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
    close: () => db.close(),
  };
}
