const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Create Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
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

    // Seed data
    const seedUser = async (email, plainPassword) => {
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        db.run('INSERT OR IGNORE INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
    };

    seedUser('admin@bluemind.net', 'password123');
    seedUser('user1@bluemind.net', 'user1pass');
    seedUser('user2@bluemind.net', 'user2pass');

    // Add some initial messages
    db.run('INSERT INTO messages (sender_id, receiver_id, content) SELECT 2, 1, "Hello Admin, please check the new security policy." WHERE NOT EXISTS (SELECT 1 FROM messages WHERE content = "Hello Admin, please check the new security policy.")');
    db.run('INSERT INTO messages (sender_id, receiver_id, content) SELECT 3, 1, "Hey, did you see the meeting minutes?" WHERE NOT EXISTS (SELECT 1 FROM messages WHERE content = "Hey, did you see the meeting minutes?")');
});

module.exports = db;
