const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const db = new sqlite3.Database(path.join(__dirname, '../messaging.db'));

// Initialize database tables
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Messages table
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        recipient_id INTEGER NOT NULL,
        subject TEXT NOT NULL,
        content TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users (id),
        FOREIGN KEY (recipient_id) REFERENCES users (id)
    )`);

    // Create indexes for performance
    db.run(`CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)`);
});

// Database functions

// User functions
const createUser = (email, hashedPassword) => {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
        stmt.run(email, hashedPassword, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, email });
            }
        });
        stmt.finalize();
    });
};

const getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

const getAllUsers = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT id, email FROM users ORDER BY email', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Message functions
const createMessage = (senderId, recipientId, subject, content) => {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('INSERT INTO messages (sender_id, recipient_id, subject, content) VALUES (?, ?, ?, ?)');
        stmt.run(senderId, recipientId, subject, content, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID });
            }
        });
        stmt.finalize();
    });
};

const getMessagesForUser = (userId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT m.*, u.email as sender_email 
            FROM messages m 
            JOIN users u ON m.sender_id = u.id 
            WHERE m.recipient_id = ? 
            ORDER BY m.created_at DESC
        `;
        db.all(query, [userId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

const getSentMessages = (userId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT m.*, u.email as recipient_email 
            FROM messages m 
            JOIN users u ON m.recipient_id = u.id 
            WHERE m.sender_id = ? 
            ORDER BY m.created_at DESC
        `;
        db.all(query, [userId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

const getMessage = (messageId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT m.*, 
                   s.email as sender_email,
                   r.email as recipient_email
            FROM messages m 
            JOIN users s ON m.sender_id = s.id 
            JOIN users r ON m.recipient_id = r.id 
            WHERE m.id = ?
        `;
        db.get(query, [messageId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

const markMessageAsRead = (messageId) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE messages SET is_read = 1 WHERE id = ?', [messageId], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

module.exports = {
    createUser,
    getUserByEmail,
    getAllUsers,
    createMessage,
    getMessagesForUser,
    getSentMessages,
    getMessage,
    markMessageAsRead
};