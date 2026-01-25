const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./database/database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

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
        FOREIGN KEY (sender_id) REFERENCES users (id),
        FOREIGN KEY (recipient_id) REFERENCES users (id)
    )`);

    const users = [
        { email: 'user1@example.com', password: 'password1' },
        { email: 'user2@example.com', password: 'password2' }
    ];

    const messages = [
        { sender_id: 1, recipient_id: 2, subject: 'Hello', body: 'This is a test message.' },
        { sender_id: 2, recipient_id: 1, subject: 'Re: Hello', body: 'This is a reply.' }
    ];

    users.forEach(user => {
        bcrypt.hash(user.password, 10, (err, hash) => {
            if (err) {
                return console.error(err.message);
            }
            db.run('INSERT INTO users (email, password) VALUES (?, ?)', [user.email, hash], (err) => {
                if (err) {
                    return console.error(err.message);
                }
            });
        });
    });

    messages.forEach(message => {
        db.run('INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?)', [message.sender_id, message.recipient_id, message.subject, message.body], (err) => {
            if (err) {
                return console.error(err.message);
            }
        });
    });
});

db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Closed the database connection.');
});
