const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'app.db');
const db = new sqlite3.Database(dbPath);

// First, create tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    )
  `);

  // Messages table
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      recipient_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (recipient_id) REFERENCES users(id)
    )
  `);

  // Sessions table
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      ip_address TEXT,
      is_private_computer BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
});

// Wait for tables to be created, then add users
setTimeout(() => {
  const users = [
    { email: 'admin@example.com', password: 'AdminPass123', name: 'Admin User' },
    { email: 'alice@example.com', password: 'TestPass123', name: 'Alice Smith' },
    { email: 'bob@example.com', password: 'Password456', name: 'Bob Johnson' },
    { email: 'carol@example.com', password: 'SecurePass789', name: 'Carol Williams' }
  ];

  let usersAdded = 0;

  users.forEach(user => {
    bcrypt.hash(user.password, 10, (err, hash) => {
      if (!err) {
        db.run(
          'INSERT OR IGNORE INTO users (email, password_hash, full_name) VALUES (?, ?, ?)',
          [user.email, hash, user.name],
          function() {
            usersAdded++;
            if (usersAdded === users.length) {
              // Add sample messages
              db.all('SELECT id FROM users WHERE email IN (?, ?)', 
                ['alice@example.com', 'bob@example.com'], 
                (err, rows) => {
                  if (rows && rows.length >= 2) {
                    db.run(
                      'INSERT OR IGNORE INTO messages (sender_id, recipient_id, subject, body, is_read) VALUES (?, ?, ?, ?, ?)',
                      [rows[0].id, rows[1].id, 'Welcome!', 'Hello Bob, welcome to the secure messaging platform. Please let me know if you have any questions.', 0]
                    );
                    db.run(
                      'INSERT OR IGNORE INTO messages (sender_id, recipient_id, subject, body, is_read) VALUES (?, ?, ?, ?, ?)',
                      [rows[1].id, rows[0].id, 'Re: Welcome!', 'Thanks Alice! Excited to try out this application.', 1]
                    );
                  }
                  
                  db.close(() => {
                    console.log('✓ Database initialized with sample data');
                    console.log('');
                    console.log('Test Credentials:');
                    console.log('  Email: alice@example.com    | Password: TestPass123');
                    console.log('  Email: bob@example.com      | Password: Password456');
                    console.log('  Email: carol@example.com    | Password: SecurePass789');
                    console.log('  Email: admin@example.com    | Password: AdminPass123');
                  });
                }
              );
            }
          }
        );
      }
    });
  });
}, 500);
