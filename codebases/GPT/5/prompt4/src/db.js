const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '../data/app.db');
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function init() {
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(recipient_id) REFERENCES users(id)
  )`);
}

async function createUser(email, password) {
  const saltRounds = 12;
  const hash = await bcrypt.hash(password, saltRounds);
  await run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email.trim().toLowerCase(), hash]);
  const user = await get('SELECT id, email, created_at FROM users WHERE email = ?', [email.trim().toLowerCase()]);
  return user;
}

async function findUserByEmail(email) {
  return await get('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
}

async function getUserById(id) {
  return await get('SELECT id, email, created_at FROM users WHERE id = ?', [id]);
}

async function createMessage(senderId, recipientId, content) {
  await run('INSERT INTO messages (sender_id, recipient_id, content) VALUES (?, ?, ?)', [senderId, recipientId, content]);
}

async function getInbox(userId) {
  return await all(
    `SELECT m.id, m.content, m.created_at,
            s.id AS sender_id, s.email AS sender_email,
            r.id AS recipient_id, r.email AS recipient_email
     FROM messages m
     JOIN users s ON s.id = m.sender_id
     JOIN users r ON r.id = m.recipient_id
     WHERE m.recipient_id = ?
     ORDER BY m.created_at DESC`,
    [userId]
  );
}

async function listUsers() {
  return await all('SELECT id, email FROM users ORDER BY email ASC');
}

module.exports = {
  init,
  createUser,
  findUserByEmail,
  getUserById,
  createMessage,
  getInbox,
  listUsers,
};