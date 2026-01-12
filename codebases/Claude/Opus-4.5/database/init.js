/**
 * Database Initialization
 * 
 * Educational Notes:
 * - We use SQLite for simplicity, but production apps might use PostgreSQL or MySQL
 * - Passwords are NEVER stored in plain text - always hashed with bcrypt
 * - bcrypt automatically handles salting (random data added before hashing)
 * - The cost factor (10) determines how computationally expensive hashing is
 */

const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

const DB_PATH = path.join(__dirname, 'app.sqlite');

function initializeDatabase() {
    const db = new Database(DB_PATH);

    // Enable foreign keys for referential integrity
    db.pragma('foreign_keys = ON');

    // ==========================================================================
    // CREATE TABLES
    // ==========================================================================

    // Users table with secure password storage
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            display_name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME,
            failed_login_attempts INTEGER DEFAULT 0,
            locked_until DATETIME
        )
    `);

    // Messages table for user-to-user communication
    db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            recipient_id INTEGER NOT NULL,
            subject TEXT NOT NULL,
            body TEXT NOT NULL,
            is_read BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(id),
            FOREIGN KEY (recipient_id) REFERENCES users(id)
        )
    `);

    // Create indexes for performance
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
        CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    // ==========================================================================
    // SEED DEMO DATA
    // ==========================================================================

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('alice@bluemind.net');
    
    if (!existingUser) {
        console.log('Seeding database with demo users...');

        // Hash passwords with bcrypt
        // Cost factor of 10 is a good balance between security and performance
        const SALT_ROUNDS = 10;

        const users = [
            { email: 'alice@bluemind.net', password: 'password123', name: 'Alice Johnson' },
            { email: 'bob@bluemind.net', password: 'password456', name: 'Bob Smith' },
            { email: 'charlie@bluemind.net', password: 'password789', name: 'Charlie Brown' }
        ];

        const insertUser = db.prepare(`
            INSERT INTO users (email, password_hash, display_name) 
            VALUES (?, ?, ?)
        `);

        for (const user of users) {
            // IMPORTANT: This is synchronous for seeding only
            // In production routes, use bcrypt.hash() (async)
            const hash = bcrypt.hashSync(user.password, SALT_ROUNDS);
            insertUser.run(user.email, hash, user.name);
            console.log(`  Created user: ${user.email}`);
        }

        // Get user IDs for seeding messages
        const alice = db.prepare('SELECT id FROM users WHERE email = ?').get('alice@bluemind.net');
        const bob = db.prepare('SELECT id FROM users WHERE email = ?').get('bob@bluemind.net');
        const charlie = db.prepare('SELECT id FROM users WHERE email = ?').get('charlie@bluemind.net');

        // Seed some demo messages
        const insertMessage = db.prepare(`
            INSERT INTO messages (sender_id, recipient_id, subject, body, is_read) 
            VALUES (?, ?, ?, ?, ?)
        `);

        const demoMessages = [
            {
                from: bob.id,
                to: alice.id,
                subject: 'Welcome to BlueMind!',
                body: 'Hi Alice,\n\nWelcome to our secure messaging platform! Feel free to send me a message anytime.\n\nBest regards,\nBob',
                read: false
            },
            {
                from: charlie.id,
                to: alice.id,
                subject: 'Project Update',
                body: 'Hi Alice,\n\nJust wanted to give you an update on the project. Everything is going smoothly.\n\nThanks,\nCharlie',
                read: false
            },
            {
                from: alice.id,
                to: bob.id,
                subject: 'Meeting Tomorrow',
                body: 'Hi Bob,\n\nDon\'t forget about our meeting tomorrow at 10 AM.\n\nSee you then!\nAlice',
                read: true
            },
            {
                from: charlie.id,
                to: bob.id,
                subject: 'Question about the assignment',
                body: 'Hey Bob,\n\nI had a question about the security assignment. When you have a moment, could you explain the bcrypt salt rounds?\n\nThanks!\nCharlie',
                read: false
            }
        ];

        for (const msg of demoMessages) {
            insertMessage.run(msg.from, msg.to, msg.subject, msg.body, msg.read ? 1 : 0);
        }

        console.log('  Created demo messages');
    }

    db.close();
    console.log('Database initialized successfully!');
}

// Export for use in other modules
function getDatabase() {
    return new Database(DB_PATH);
}

module.exports = { initializeDatabase, getDatabase, DB_PATH };
