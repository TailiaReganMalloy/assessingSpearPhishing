const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'messaging.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initialize = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Create users table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) return reject(err);
            });

            // Create messages table
            db.run(`CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_id INTEGER NOT NULL,
                recipient_id INTEGER NOT NULL,
                subject TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                read_at DATETIME,
                FOREIGN KEY (sender_id) REFERENCES users (id),
                FOREIGN KEY (recipient_id) REFERENCES users (id)
            )`, (err) => {
                if (err) return reject(err);
                resolve();
            });

            // Create indexes for better performance
            db.run(`CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
        });
    });
};

// User operations
const createUser = (email, password) => {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
        stmt.run(email, password, function(err) {
            if (err) return reject(err);
            resolve(this.lastID);
        });
        stmt.finalize();
    });
};

const getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
};

const getUserById = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
};

// Message operations
const createMessage = (senderId, recipientId, subject, message) => {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(
            'INSERT INTO messages (sender_id, recipient_id, subject, message) VALUES (?, ?, ?, ?)'
        );
        stmt.run(senderId, recipientId, subject, message, function(err) {
            if (err) return reject(err);
            resolve(this.lastID);
        });
        stmt.finalize();
    });
};

const getMessagesForUser = (userId) => {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT m.*, u.email as sender_email 
            FROM messages m 
            JOIN users u ON m.sender_id = u.id 
            WHERE m.recipient_id = ? 
            ORDER BY m.created_at DESC
        `, [userId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

const markMessageAsRead = (messageId) => {
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND read_at IS NULL',
            [messageId],
            function(err) {
                if (err) return reject(err);
                resolve(this.changes);
            }
        );
    });
};

// Export database functions
module.exports = {
    initialize,
    createUser,
    getUserByEmail,
    getUserById,
    createMessage,
    getMessagesForUser,
    markMessageAsRead
};