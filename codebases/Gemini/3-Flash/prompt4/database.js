const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password_hash TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender TEXT,
        content TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

module.exports = {
    getUserByEmail: (email) => {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },
    createUser: (email, hashedPassword) => {
        return new Promise((resolve, reject) => {
            db.run("INSERT INTO users (email, password_hash) VALUES (?, ?)", [email, hashedPassword], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    },
    getMessages: () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM messages ORDER BY timestamp DESC", [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },
    saveMessage: (sender, content) => {
        return new Promise((resolve, reject) => {
            db.run("INSERT INTO messages (sender, content) VALUES (?, ?)", [sender, content], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }
};
