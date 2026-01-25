const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../database/app.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database.');
        this.initTables();
      }
    });
  }

  initTables() {
    // Users table with security features
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until DATETIME,
        last_login DATETIME
      )
    `);

    // Messages table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        recipient_id INTEGER NOT NULL,
        subject TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        read_at DATETIME,
        FOREIGN KEY (sender_id) REFERENCES users (id),
        FOREIGN KEY (recipient_id) REFERENCES users (id)
      )
    `);

    // Login attempts table for security logging
    this.db.run(`
      CREATE TABLE IF NOT EXISTS login_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        success BOOLEAN NOT NULL,
        attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  // User methods
  getUserByEmail(email, callback) {
    this.db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      callback
    );
  }

  createUser(email, passwordHash, callback) {
    this.db.run(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, passwordHash],
      callback
    );
  }

  updateUserLoginAttempts(email, attempts, lockUntil, callback) {
    this.db.run(
      'UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE email = ?',
      [attempts, lockUntil, email],
      callback
    );
  }

  updateLastLogin(userId, callback) {
    this.db.run(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP, failed_login_attempts = 0, locked_until = NULL WHERE id = ?',
      [userId],
      callback
    );
  }

  // Message methods
  getMessagesForUser(userId, callback) {
    this.db.all(`
      SELECT 
        m.*, 
        sender.email as sender_email,
        recipient.email as recipient_email
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users recipient ON m.recipient_id = recipient.id
      WHERE m.recipient_id = ? OR m.sender_id = ?
      ORDER BY m.created_at DESC
    `, [userId, userId], callback);
  }

  sendMessage(senderId, recipientId, subject, content, callback) {
    this.db.run(
      'INSERT INTO messages (sender_id, recipient_id, subject, content) VALUES (?, ?, ?, ?)',
      [senderId, recipientId, subject, content],
      callback
    );
  }

  markMessageAsRead(messageId, userId, callback) {
    this.db.run(
      'UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND recipient_id = ?',
      [messageId, userId],
      callback
    );
  }

  // Get all users for messaging
  getAllUsers(callback) {
    this.db.all(
      'SELECT id, email FROM users ORDER BY email',
      callback
    );
  }

  // Security logging
  logLoginAttempt(email, ipAddress, userAgent, success, callback) {
    this.db.run(
      'INSERT INTO login_attempts (email, ip_address, user_agent, success) VALUES (?, ?, ?, ?)',
      [email, ipAddress, userAgent, success],
      callback
    );
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  }
}

module.exports = new Database();