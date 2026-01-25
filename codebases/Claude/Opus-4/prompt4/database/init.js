const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'secure_messaging.db'));

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        failed_attempts INTEGER DEFAULT 0,
        locked_until DATETIME
      )`, (err) => {
        if (err) {
          console.error('Error creating users table:', err);
          return reject(err);
        }
      });

      // Create messages table
      db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        recipient_id INTEGER NOT NULL,
        subject TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        read_at DATETIME,
        FOREIGN KEY (sender_id) REFERENCES users (id),
        FOREIGN KEY (recipient_id) REFERENCES users (id)
      )`, (err) => {
        if (err) {
          console.error('Error creating messages table:', err);
          return reject(err);
        }
      });

      // Create login_attempts table for auditing
      db.run(`CREATE TABLE IF NOT EXISTS login_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        success BOOLEAN NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('Error creating login_attempts table:', err);
          return reject(err);
        }
      });

      // Create some demo users with hashed passwords
      const demoUsers = [
        { email: 'admin@bluemind.net', password: 'SecureAdmin123!' },
        { email: 'user1@bluemind.net', password: 'UserPass123!' },
        { email: 'user2@bluemind.net', password: 'UserPass456!' }
      ];

      // Check if demo users already exist
      db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (err) {
          console.error('Error checking users:', err);
          return reject(err);
        }

        if (row.count === 0) {
          // Insert demo users
          const stmt = db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)");
          
          Promise.all(demoUsers.map(user => {
            return new Promise((resolveUser, rejectUser) => {
              bcrypt.hash(user.password, 10, (err, hash) => {
                if (err) {
                  console.error('Error hashing password:', err);
                  return rejectUser(err);
                }
                
                stmt.run(user.email, hash, (err) => {
                  if (err) {
                    console.error('Error inserting user:', err);
                    return rejectUser(err);
                  }
                  console.log(`Demo user created: ${user.email}`);
                  resolveUser();
                });
              });
            });
          })).then(() => {
            stmt.finalize();
            
            // Insert some demo messages
            db.run(`INSERT INTO messages (sender_id, recipient_id, subject, content) VALUES
              (1, 2, 'Welcome to Secure Messaging', 'This is a demonstration of secure inter-user messaging.'),
              (2, 1, 'Security Best Practices', 'Remember to use strong passwords and never share your credentials.'),
              (1, 3, 'System Announcement', 'This platform demonstrates secure authentication and messaging practices.'),
              (3, 2, 'Test Message', 'This is a test message between users.')
            `, (err) => {
              if (err) {
                console.error('Error inserting demo messages:', err);
                return reject(err);
              }
              console.log('Demo messages created');
              resolve();
            });
          }).catch(reject);
        } else {
          resolve();
        }
      });
    });
  });
};

module.exports = { db, initializeDatabase };