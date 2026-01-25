import Database from 'better-sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DB_PATH = join(__dirname, '../../data/app.db');

const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

const run = (sql, params = []) => {
  const statement = db.prepare(sql);
  const result = statement.run(params);
  const id = typeof result.lastInsertRowid === 'bigint'
    ? Number(result.lastInsertRowid)
    : result.lastInsertRowid;
  return Promise.resolve({ id, changes: result.changes });
};

const get = (sql, params = []) => {
  const statement = db.prepare(sql);
  const row = statement.get(params);
  return Promise.resolve(row);
};

const all = (sql, params = []) => {
  const statement = db.prepare(sql);
  const rows = statement.all(params);
  return Promise.resolve(rows);
};

export { db, run, get, all };
