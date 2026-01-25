const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.resolve(__dirname, 'bluemind.db');

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
                password TEXT NOT NULL
            )`, (err) => {
                if (err) {
                    console.error("Error creating users table:", err.message);
                } else {
                    // Check if default user exists, if not create one
                    const checkStmt = db.prepare("SELECT count(*) as count FROM users WHERE email = ?");
                    checkStmt.get("email@bluemind.net", (err, row) => {
                        if (row.count === 0) {
                            const password = 'password123';
                            const saltRounds = 10;
                            bcrypt.hash(password, saltRounds, function(err, hash) {
                                if (err) {
                                    console.error("Error hashing password:", err);
                                } else {
                                    const insert = db.prepare("INSERT INTO users (email, password) VALUES (?, ?)");
                                    insert.run("email@bluemind.net", hash);
                                    insert.finalize();
                                    console.log("Default user created: email@bluemind.net / password123");
                                }
                            });
                        }
                    });
                    checkStmt.finalize();
                }
            });

            // Create Messages Table
            db.run(`CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_email TEXT NOT NULL,
                receiver_email TEXT NOT NULL,
                subject TEXT,
                body TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
            
             // Seed some messages
             db.run(`INSERT INTO messages (sender_email, receiver_email, subject, body) 
                    SELECT 'admin@bluemind.net', 'email@bluemind.net', 'Welcome to BlueMind', 'This is a secure messaging platform prototype.'
                    WHERE NOT EXISTS (SELECT 1 FROM messages WHERE receiver_email = 'email@bluemind.net')`);
        });
    }
});

module.exports = db;
