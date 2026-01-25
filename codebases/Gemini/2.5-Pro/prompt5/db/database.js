
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./db/users.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the users database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )`, (err) => {
        if (err) {
            console.error(err.message);
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER,
        recipient_id INTEGER,
        subject TEXT,
        message TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (recipient_id) REFERENCES users(id)
    )`, (err) => {
        if (err) {
            console.error(err.message);
        }
    });

    const saltRounds = 10;
    const password = 'password123';
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.error(err.message);
        }
        const user = { email: 'email@bluemind.net', password: hash };
        db.run(`INSERT OR IGNORE INTO users (email, password) VALUES (?, ?)`, [user.email, user.password], function(err) {
            if (err) {
                return console.log(err.message);
            }
            if (this.changes > 0) {
                const userId = this.lastID;
                db.run(`INSERT INTO messages (sender_id, recipient_id, subject, message) VALUES (?, ?, ?, ?)`, 
                    [userId, userId, 'Welcome!', 'This is your first message.']);
            }
        });
    });
});

module.exports = db;
