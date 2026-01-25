const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'app.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

const migrations = [
  `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
  `CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
];

migrations.forEach((sql) => db.prepare(sql).run());

function upsertUser({ email, passwordHash, displayName }) {
  const normalizedEmail = email.trim().toLowerCase();
  const safeName = displayName.trim();
  const stmt = db.prepare(`
    INSERT INTO users (email, password_hash, display_name)
    VALUES (@email, @passwordHash, @displayName)
    ON CONFLICT(email) DO UPDATE SET
      password_hash = excluded.password_hash,
      display_name = excluded.display_name
  `);
  stmt.run({ email: normalizedEmail, passwordHash, displayName: safeName });
  return findUserByEmail(normalizedEmail);
}

function findUserByEmail(email) {
  if (!email) return undefined;
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());
}

function findUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function createMessage({ senderId, recipientId, subject, body }) {
  const stmt = db.prepare(`
    INSERT INTO messages (sender_id, recipient_id, subject, body)
    VALUES (@senderId, @recipientId, @subject, @body)
  `);
  return stmt.run({ senderId, recipientId, subject, body });
}

function getInboxMessages(userId) {
  return db
    .prepare(`
      SELECT messages.*, users.display_name AS sender_name, users.email AS sender_email
      FROM messages
      JOIN users ON users.id = messages.sender_id
      WHERE messages.recipient_id = ?
      ORDER BY messages.created_at DESC
    `)
    .all(userId);
}

function markMessageRead(messageId) {
  db.prepare('UPDATE messages SET is_read = 1 WHERE id = ?').run(messageId);
}

function clearAllData() {
  db.prepare('DELETE FROM messages').run();
  db.prepare('DELETE FROM users').run();
}

module.exports = {
  db,
  upsertUser,
  findUserByEmail,
  findUserById,
  createMessage,
  getInboxMessages,
  markMessageRead,
  clearAllData
};
