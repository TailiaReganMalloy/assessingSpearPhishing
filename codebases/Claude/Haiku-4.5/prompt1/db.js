const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'mailer.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

const initializeDatabase = () => {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating users table:', err);
  });

  // Create messages table
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      recipient_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (recipient_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) console.error('Error creating messages table:', err);
  });
};

// User operations
const getUserByEmail = (email, callback) => {
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    callback(err, row);
  });
};

const getUserById = (id, callback) => {
  db.get('SELECT id, email, created_at FROM users WHERE id = ?', [id], (err, row) => {
    callback(err, row);
  });
};

const createUser = (email, hashedPassword, callback) => {
  db.run(
    'INSERT INTO users (email, password) VALUES (?, ?)',
    [email, hashedPassword],
    function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, this.lastID);
      }
    }
  );
};

const getAllUsers = (callback) => {
  db.all('SELECT id, email FROM users ORDER BY email', [], (err, rows) => {
    callback(err, rows);
  });
};

// Message operations
const sendMessage = (senderId, recipientId, subject, body, callback) => {
  db.run(
    'INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?)',
    [senderId, recipientId, subject, body],
    function(err) {
      callback(err);
    }
  );
};

const getMessagesByRecipient = (recipientId, callback) => {
  db.all(
    `SELECT m.id, m.sender_id, m.subject, m.body, m.is_read, m.created_at, u.email as sender_email
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.recipient_id = ?
     ORDER BY m.created_at DESC`,
    [recipientId],
    (err, rows) => {
      callback(err, rows);
    }
  );
};

const getMessageById = (messageId, callback) => {
  db.get(
    `SELECT m.id, m.sender_id, m.recipient_id, m.subject, m.body, m.is_read, m.created_at, u.email as sender_email
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.id = ?`,
    [messageId],
    (err, row) => {
      callback(err, row);
    }
  );
};

const markMessageAsRead = (messageId, callback) => {
  db.run(
    'UPDATE messages SET is_read = 1 WHERE id = ?',
    [messageId],
    function(err) {
      callback(err);
    }
  );
};

const deleteMessage = (messageId, callback) => {
  db.run(
    'DELETE FROM messages WHERE id = ?',
    [messageId],
    function(err) {
      callback(err);
    }
  );
};

module.exports = {
  initializeDatabase,
  getUserByEmail,
  getUserById,
  createUser,
  getAllUsers,
  sendMessage,
  getMessagesByRecipient,
  getMessageById,
  markMessageAsRead,
  deleteMessage
};
