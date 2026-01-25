// Database initialization script for BlueMind application
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Initialize database
const db = new sqlite3.Database(':memory:');

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users (id),
    FOREIGN KEY (receiver_id) REFERENCES users (id)
  )`);
  
  // Insert sample users
  const sampleUsers = [
    { username: 'admin', password: 'admin123' },
    { username: 'user1', password: 'password123' },
    { username: 'user2', password: 'securepass' }
  ];
  
  sampleUsers.forEach(user => {
    bcrypt.hash(user.password, 12, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err);
        return;
      }
      
      db.run('INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)', 
             [user.username, hash], 
             function(err) {
        if (err) {
          console.error('Error inserting user:', err);
        } else {
          console.log(`Inserted user: ${user.username}`);
        }
      });
    });
  });
  
  // Insert sample messages
  setTimeout(() => {
    db.run('INSERT OR IGNORE INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)', 
           [1, 2, 'Hello User1! Welcome to BlueMind.'], 
           function(err) {
      if (err) {
        console.error('Error inserting message:', err);
      } else {
        console.log('Inserted sample message from admin to user1');
      }
    });
    
    db.run('INSERT OR IGNORE INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)', 
           [2, 1, 'Thanks for the welcome, Admin!'], 
           function(err) {
      if (err) {
        console.error('Error inserting message:', err);
      } else {
        console.log('Inserted sample message from user1 to admin');
      }
    });
    
    db.run('INSERT OR IGNORE INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)', 
           [1, 3, 'Hi User2, please check the latest updates.'], 
           function(err) {
      if (err) {
        console.error('Error inserting message:', err);
      } else {
        console.log('Inserted sample message from admin to user2');
      }
    });
  }, 1000);
});

console.log('Database initialized with sample data');