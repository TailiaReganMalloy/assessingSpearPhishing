const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const DBSOURCE = "db.sqlite";

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email text UNIQUE, 
                password text, 
                CONSTRAINT email_unique UNIQUE (email)
                )`,
            (err) => {
                if (err) {
                    // Table already created
                } else {
                    // Table just created, creating some rows
                    const saltRounds = 10;
                    bcrypt.hash('admin123', saltRounds, (err, hash) => {
                        const insert = 'INSERT INTO users (email, password) VALUES (?,?)'
                        db.run(insert, ["admin@example.com",hash])
                    });
                    bcrypt.hash('user123', saltRounds, (err, hash) => {
                        const insert = 'INSERT INTO users (email, password) VALUES (?,?)'
                        db.run(insert, ["user@example.com",hash])
                    });
                }
            });  
            db.run(`CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_id INTEGER,
                receiver_id INTEGER,
                message TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users(id),
                FOREIGN KEY (receiver_id) REFERENCES users(id)
            )`,
            (err) => {
                if (err) {
                    // Table already created
                } else {
                    // Table just created, creating some rows
                    const insert = 'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?,?,?)'
                    db.run(insert, [1, 2, "Hello user, this is a test message from admin."])
                    db.run(insert, [2, 1, "Hello admin, I received your message."])
                }
            });
        });
    }
});

module.exports = db;
