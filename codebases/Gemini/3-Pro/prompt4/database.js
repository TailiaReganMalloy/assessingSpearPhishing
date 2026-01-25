const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.resolve(__dirname, 'app.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        db.serialize(() => {
            // Create Users Table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT
            )`);

            // Create Messages Table
            db.run(`CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_id INTEGER NOT NULL,
                receiver_email TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users(id)
            )`);

            // Seed a demo user if not exists
            const seedEmail = 'email@bluemind.net';
            const seedPassword = 'password123';
            const saltRounds = 10;

            db.get("SELECT id FROM users WHERE email = ?", [seedEmail], (err, row) => {
                if (!row) {
                    bcrypt.hash(seedPassword, saltRounds, (err, hash) => {
                        if (err) console.error(err);
                        db.run("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)", 
                            [seedEmail, hash, 'Demo User'], 
                            (err) => {
                                if (err) console.error('Error seeding user:', err);
                                else console.log('Seeded demo user: email@bluemind.net / password123');
                            }
                        );
                    });
                }
            });
        });
    }
});

module.exports = db;
