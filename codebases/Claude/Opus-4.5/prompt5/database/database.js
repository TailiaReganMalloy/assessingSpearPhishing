const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

// Database initialization and setup
class Database {
    constructor() {
        this.dbPath = process.env.DB_PATH || './database/bluemind.db';
        this.init();
    }

    init() {
        // Ensure database directory exists
        const dbDir = path.dirname(this.dbPath);
        const fs = require('fs');
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        this.db = new sqlite3.Database(this.dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err);
            } else {
                console.log('Connected to SQLite database');
                this.createTables();
                this.createDefaultUsers();
            }
        });
    }

    createTables() {
        // Users table with security features
        this.db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME,
                login_attempts INTEGER DEFAULT 0,
                locked_until DATETIME,
                is_active BOOLEAN DEFAULT 1
            )
        `);

        // Messages table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_id INTEGER NOT NULL,
                recipient_id INTEGER NOT NULL,
                subject TEXT NOT NULL,
                body TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                read_at DATETIME,
                FOREIGN KEY (sender_id) REFERENCES users (id),
                FOREIGN KEY (recipient_id) REFERENCES users (id)
            )
        `);

        // Session tracking for security
        this.db.run(`
            CREATE TABLE IF NOT EXISTS user_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                session_id TEXT NOT NULL,
                ip_address TEXT,
                user_agent TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT 1,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `);
    }

    async createDefaultUsers() {
        // Create demo users for educational purposes
        const demoUsers = [
            { email: 'admin@bluemind.net', password: 'SecurePass123!' },
            { email: 'user1@bluemind.net', password: 'UserPass456!' },
            { email: 'user2@bluemind.net', password: 'TestPass789!' }
        ];

        for (const user of demoUsers) {
            try {
                const hashedPassword = await bcrypt.hash(user.password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
                this.db.run(
                    'INSERT OR IGNORE INTO users (email, password_hash) VALUES (?, ?)',
                    [user.email, hashedPassword],
                    function(err) {
                        if (err && !err.message.includes('UNIQUE constraint failed')) {
                            console.error('Error creating demo user:', err);
                        }
                    }
                );
            } catch (error) {
                console.error('Error hashing password for demo user:', error);
            }
        }
    }

    getDB() {
        return this.db;
    }

    close() {
        if (this.db) {
            this.db.close();
        }
    }
}

module.exports = Database;