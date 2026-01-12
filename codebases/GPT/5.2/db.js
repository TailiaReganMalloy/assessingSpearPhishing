const path = require('path');
const sqlite3 = require('sqlite3');

const dbPath = path.join(__dirname, 'data.sqlite');

function openDb() {
  const db = new sqlite3.Database(dbPath);
  db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');
    db.run('PRAGMA journal_mode = WAL');
  });
  return db;
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function migrate(db) {
  await run(
    db,
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  );

  await run(
    db,
    `CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_user_id INTEGER NOT NULL,
      recipient_user_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      read_at TEXT,
      FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  );

  await run(db, 'CREATE INDEX IF NOT EXISTS idx_messages_recipient_created ON messages(recipient_user_id, created_at DESC)');
  await run(db, 'CREATE INDEX IF NOT EXISTS idx_messages_sender_created ON messages(sender_user_id, created_at DESC)');
}

module.exports = {
  openDb,
  migrate,
  run,
  get,
  all,
  dbPath
};
