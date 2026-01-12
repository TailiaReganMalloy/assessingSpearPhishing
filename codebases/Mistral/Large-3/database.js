const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

// Initialize database
const db = new Database(path.join(__dirname, 'database.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
function initializeDatabase() {
  // Users table - stores user credentials
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Messages table - stores messages between users
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      recipient_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users (id),
      FOREIGN KEY (recipient_id) REFERENCES users (id)
    )
  `);

  console.log('Database initialized successfully');

  // Create demo users if they don't exist
  createDemoUsers();
}

// Create demo users for testing
async function createDemoUsers() {
  const demoUsers = [
    { email: 'alice@bluemind.net', password: 'Alice123!' },
    { email: 'bob@bluemind.net', password: 'Bob123!' },
    { email: 'carol@bluemind.net', password: 'Carol123!' }
  ];

  const insertUser = db.prepare('INSERT OR IGNORE INTO users (email, password_hash) VALUES (?, ?)');

  for (const user of demoUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    insertUser.run(user.email, hashedPassword);
  }

  // Add some demo messages
  const messageExists = db.prepare('SELECT COUNT(*) as count FROM messages').get();
  
  if (messageExists.count === 0) {
    const alice = db.prepare('SELECT id FROM users WHERE email = ?').get('alice@bluemind.net');
    const bob = db.prepare('SELECT id FROM users WHERE email = ?').get('bob@bluemind.net');
    const carol = db.prepare('SELECT id FROM users WHERE email = ?').get('carol@bluemind.net');

    if (alice && bob && carol) {
      const insertMessage = db.prepare(
        'INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?)'
      );

      insertMessage.run(bob.id, alice.id, 'Welcome to BlueMind!', 
        'Hi Alice! Welcome to our secure messaging platform. This is a demo message to show you how the system works.');
      
      insertMessage.run(carol.id, alice.id, 'Project Update',
        'Hey Alice, just wanted to give you a quick update on the project. Everything is progressing smoothly.');
      
      insertMessage.run(alice.id, bob.id, 'RE: Welcome to BlueMind!',
        'Thanks Bob! This looks great. I\'m excited to use this system.');

      console.log('Demo messages created');
    }
  }

  console.log('Demo users ready. Credentials:\n- alice@bluemind.net / Alice123!\n- bob@bluemind.net / Bob123!\n- carol@bluemind.net / Carol123!');
}

// User-related database operations
const userDb = {
  // Find user by email
  findByEmail: (email) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  // Find user by ID
  findById: (id) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },

  // Create new user
  create: async (email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
    const result = stmt.run(email, hashedPassword);
    return result.lastInsertRowid;
  },

  // Verify password
  verifyPassword: async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  // Get all users (for user list)
  getAll: () => {
    const stmt = db.prepare('SELECT id, email, created_at FROM users ORDER BY email');
    return stmt.all();
  }
};

// Message-related database operations
const messageDb = {
  // Get messages for a user
  getMessagesForUser: (userId) => {
    const stmt = db.prepare(`
      SELECT 
        m.id, 
        m.subject, 
        m.body, 
        m.read,
        m.sent_at,
        sender.email as sender_email,
        recipient.email as recipient_email
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users recipient ON m.recipient_id = recipient.id
      WHERE m.recipient_id = ?
      ORDER BY m.sent_at DESC
    `);
    return stmt.all(userId);
  },

  // Get sent messages
  getSentMessages: (userId) => {
    const stmt = db.prepare(`
      SELECT 
        m.id, 
        m.subject, 
        m.body, 
        m.read,
        m.sent_at,
        sender.email as sender_email,
        recipient.email as recipient_email
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users recipient ON m.recipient_id = recipient.id
      WHERE m.sender_id = ?
      ORDER BY m.sent_at DESC
    `);
    return stmt.all(userId);
  },

  // Send a message
  send: (senderId, recipientId, subject, body) => {
    const stmt = db.prepare(
      'INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?)'
    );
    return stmt.run(senderId, recipientId, subject, body);
  },

  // Mark message as read
  markAsRead: (messageId, userId) => {
    const stmt = db.prepare(
      'UPDATE messages SET read = 1 WHERE id = ? AND recipient_id = ?'
    );
    return stmt.run(messageId, userId);
  },

  // Get message by ID
  getById: (messageId, userId) => {
    const stmt = db.prepare(`
      SELECT 
        m.id, 
        m.subject, 
        m.body, 
        m.read,
        m.sent_at,
        sender.email as sender_email,
        recipient.email as recipient_email
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users recipient ON m.recipient_id = recipient.id
      WHERE m.id = ? AND (m.recipient_id = ? OR m.sender_id = ?)
    `);
    return stmt.get(messageId, userId, userId);
  }
};

module.exports = {
  db,
  initializeDatabase,
  userDb,
  messageDb
};
