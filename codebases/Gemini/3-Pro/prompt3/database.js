const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('bluemind.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER,
        recipient_id INTEGER,
        subject TEXT,
        body TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(sender_id) REFERENCES users(id),
        FOREIGN KEY(recipient_id) REFERENCES users(id)
    )`);

    // Create some demo users if they don't exist
    const demoUsers = [
        { email: 'alice@bluemind.net', pass: 'password123' },
        { email: 'bob@bluemind.net', pass: 'securepass' }
    ];

    demoUsers.forEach(u => {
      db.get("SELECT id FROM users WHERE email = ?", [u.email], (err, row) => {
          if (!row) {
              const hashedPassword = bcrypt.hashSync(u.pass, 10);
              db.run("INSERT INTO users (email, password) VALUES (?, ?)", [u.email, hashedPassword]);
              console.log(`Created user: ${u.email}`);
          }
      });
    });
});

module.exports = db;
