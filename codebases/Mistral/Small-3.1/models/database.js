const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../messaging.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database tables
function initDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating users table:', err);
      else console.log('Users table ready');
    });

    // Messages table
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        recipient_id INTEGER NOT NULL,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (recipient_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) console.error('Error creating messages table:', err);
      else console.log('Messages table ready');
    });
  });
}

// Database helper functions
function getUserById(id, callback) {
  db.get('SELECT id, email, created_at FROM users WHERE id = ?', [id], callback);
}

function getUserByEmail(email, callback) {
  db.get('SELECT * FROM users WHERE email = ?', [email], callback);
}

function createUser(email, hashedPassword, callback) {
  db.run('INSERT INTO users (email, password) VALUES (?, ?)', 
    [email, hashedPassword], 
    function(err) {
      if (err) callback(err);
      else callback(null, this.lastID);
    }
  );
}

function getMessagesByRecipient(recipientId, callback) {
  db.all(`
    SELECT 
      m.id, 
      m.sender_id, 
      m.subject, 
      m.body, 
      m.read, 
      m.created_at,
      u.email as sender_email
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.recipient_id = ?
    ORDER BY m.created_at DESC
  `, [recipientId], callback);
}

function createMessage(senderId, recipientId, subject, body, callback) {
  db.run(`
    INSERT INTO messages (sender_id, recipient_id, subject, body) 
    VALUES (?, ?, ?, ?)
  `, [senderId, recipientId, subject, body], function(err) {
    if (err) callback(err);
    else callback(null, this.lastID);
  });
}

function markMessageAsRead(messageId, callback) {
  db.run('UPDATE messages SET read = 1 WHERE id = ?', [messageId], callback);
}

function getAllUsers(callback) {
  db.all('SELECT id, email, created_at FROM users', callback);
}

module.exports = {
  db,
  initDatabase,
  getUserById,
  getUserByEmail,
  createUser,
  getMessagesByRecipient,
  createMessage,
  markMessageAsRead,
  getAllUsers
};
