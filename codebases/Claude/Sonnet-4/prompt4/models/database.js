const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            const dbPath = path.join(__dirname, '..', 'messaging_demo.db');
            this.db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err.message);
                    reject(err);
                } else {
                    console.log('Connected to SQLite database');
                    resolve();
                }
            });
        });
    }

    initTables() {
        return new Promise((resolve, reject) => {
            // Create users table with secure password storage considerations
            const createUsersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    first_name TEXT NOT NULL,
                    last_name TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_login DATETIME,
                    failed_login_attempts INTEGER DEFAULT 0,
                    account_locked_until DATETIME,
                    is_active BOOLEAN DEFAULT 1
                )
            `;

            // Create messages table for inter-user messaging
            const createMessagesTable = `
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    sender_id INTEGER NOT NULL,
                    recipient_id INTEGER NOT NULL,
                    subject TEXT NOT NULL,
                    content TEXT NOT NULL,
                    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    read_at DATETIME,
                    is_deleted BOOLEAN DEFAULT 0,
                    FOREIGN KEY (sender_id) REFERENCES users(id),
                    FOREIGN KEY (recipient_id) REFERENCES users(id)
                )
            `;

            // Create sessions table for session management
            const createSessionsTable = `
                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    user_id INTEGER,
                    expires_at DATETIME NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            `;

            // Create indexes for performance
            const createIndexes = [
                'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
                'CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)',
                'CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id)',
                'CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)',
                'CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)'
            ];

            this.db.serialize(() => {
                this.db.run(createUsersTable);
                this.db.run(createMessagesTable);
                this.db.run(createSessionsTable);
                
                createIndexes.forEach(indexQuery => {
                    this.db.run(indexQuery);
                });

                resolve();
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('Database connection closed');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    getDb() {
        return this.db;
    }
}

module.exports = new Database();