const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Create Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

    // Create Messages table
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER,
        receiver_id INTEGER,
        content TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(sender_id) REFERENCES users(id),
        FOREIGN KEY(receiver_id) REFERENCES users(id)
    )`);

    // Add some test users if they don't exist
    const users = [
        { username: 'instructor@bluemind.net', password: 'password123' },
        { username: 'student@bluemind.net', password: 'password456' }
    ];

    users.forEach(user => {
        db.get("SELECT * FROM users WHERE username = ?", [user.username], (err, row) => {
            if (!row) {
                const hashedPassword = bcrypt.hashSync(user.password, 10);
                db.run("INSERT INTO users (username, password) VALUES (?, ?)", [user.username, hashedPassword]);
            }
        });
    });
});

module.exports = db;
