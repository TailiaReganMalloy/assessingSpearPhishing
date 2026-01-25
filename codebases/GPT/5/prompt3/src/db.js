const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'app.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

// Initialize schema if not exists
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, created_at DESC)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, created_at DESC)`);
});

// Helper to run GET/ALL/RUN as Promise
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
}

module.exports = {
  db,
  async getUserByEmail(email) {
    return await get('SELECT * FROM users WHERE email = ?', [email]);
  },
  async getUserById(id) {
    return await get('SELECT id, email, name, created_at FROM users WHERE id = ?', [id]);
  },
  async createUser(email, name, passwordHash) {
    const id = await run('INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)', [email.toLowerCase(), name, passwordHash]);
    return id;
  },
  async listUsersExcept(userId) {
    return await all('SELECT id, email, name FROM users WHERE id <> ? ORDER BY name', [userId]);
  },
  async getInbox(userId) {
    return await all(`
      SELECT m.id, m.content, m.created_at, m.read_at,
             s.id AS sender_id, s.name AS sender_name, s.email AS sender_email
      FROM messages m
      JOIN users s ON s.id = m.sender_id
      WHERE m.recipient_id = ?
      ORDER BY m.created_at DESC
    `, [userId]);
  },
  async getSent(userId) {
    return await all(`
      SELECT m.id, m.content, m.created_at, m.read_at,
             r.id AS recipient_id, r.name AS recipient_name, r.email AS recipient_email
      FROM messages m
      JOIN users r ON r.id = m.recipient_id
      WHERE m.sender_id = ?
      ORDER BY m.created_at DESC
    `, [userId]);
  },
  async createMessage(senderId, recipientId, content) {
    return await run('INSERT INTO messages (sender_id, recipient_id, content) VALUES (?, ?, ?)', [senderId, recipientId, content.trim()]);
  },
  async markRead(messageId, recipientId) {
    await run('UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND recipient_id = ?', [messageId, recipientId]);
  }
};
