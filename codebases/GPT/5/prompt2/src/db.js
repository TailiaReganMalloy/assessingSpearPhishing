import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';

const defaultDbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'app.db');

export async function initDB() {
  const dbDir = path.dirname(defaultDbPath);
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  const db = await open({ filename: defaultDbPath, driver: sqlite3.Database });

  await db.exec('PRAGMA foreign_keys = ON');
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      recipient_id INTEGER NOT NULL,
      subject TEXT,
      body TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      read_at DATETIME,
      FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(recipient_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  return db;
}

export async function getUserByEmail(db, email) {
  return db.get('SELECT * FROM users WHERE email = ?', email.toLowerCase());
}

export async function getUserById(db, id) {
  return db.get('SELECT * FROM users WHERE id = ?', id);
}

export async function createUser(db, { email, name, password_hash }) {
  const result = await db.run(
    'INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)',
    email.toLowerCase(),
    name,
    password_hash
  );
  return getUserById(db, result.lastID);
}

export async function listUsers(db) {
  return db.all('SELECT id, email, name FROM users ORDER BY name');
}

export async function sendMessage(db, { sender_id, recipient_id, subject, body }) {
  const result = await db.run(
    'INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?)',
    sender_id,
    recipient_id,
    subject || null,
    body
  );
  return db.get('SELECT * FROM messages WHERE id = ?', result.lastID);
}

export async function inboxFor(db, userId) {
  return db.all(
    `SELECT m.*, u.name AS sender_name, u.email AS sender_email
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.recipient_id = ?
     ORDER BY m.created_at DESC`,
    userId
  );
}

export async function outboxFor(db, userId) {
  return db.all(
    `SELECT m.*, u.name AS recipient_name, u.email AS recipient_email
     FROM messages m
     JOIN users u ON u.id = m.recipient_id
     WHERE m.sender_id = ?
     ORDER BY m.created_at DESC`,
    userId
  );
}

export async function markRead(db, messageId) {
  return db.run('UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND read_at IS NULL', messageId);
}
