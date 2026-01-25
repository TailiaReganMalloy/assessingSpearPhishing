const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config();

// Database setup
const dbPath = process.env.DB_PATH || './database/app.db';
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log('Connected to SQLite database for initialization.');
    }
});

// Initialize database with sample data
async function initializeDatabase() {
    console.log('🔧 Initializing database...');
    
    try {
        // Create tables
        await new Promise((resolve, reject) => {
            db.serialize(() => {
                // Users table
                db.run(`CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_login DATETIME
                )`, (err) => {
                    if (err) reject(err);
                });

                // Messages table
                db.run(`CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    sender_id INTEGER NOT NULL,
                    recipient_id INTEGER NOT NULL,
                    subject TEXT NOT NULL,
                    body TEXT NOT NULL,
                    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    read_at DATETIME,
                    FOREIGN KEY (sender_id) REFERENCES users(id),
                    FOREIGN KEY (recipient_id) REFERENCES users(id)
                )`, (err) => {
                    if (err) reject(err);
                });

                // Login attempts table
                db.run(`CREATE TABLE IF NOT EXISTS login_attempts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT NOT NULL,
                    ip_address TEXT NOT NULL,
                    success BOOLEAN NOT NULL,
                    attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });

        console.log('✅ Database tables created successfully');

        // Create sample users
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        
        const sampleUsers = [
            { email: 'professor@bluemind.net', password: 'SecurePass123!' },
            { email: 'student1@bluemind.net', password: 'StudentPass1!' },
            { email: 'student2@bluemind.net', password: 'StudentPass2!' },
            { email: 'admin@bluemind.net', password: 'AdminSecure456!' }
        ];

        console.log('👤 Creating sample users...');
        
        for (const user of sampleUsers) {
            const hashedPassword = await bcrypt.hash(user.password, saltRounds);
            
            await new Promise((resolve, reject) => {
                db.run('INSERT OR IGNORE INTO users (email, password_hash) VALUES (?, ?)',
                       [user.email, hashedPassword], function(err) {
                    if (err) reject(err);
                    else {
                        if (this.changes > 0) {
                            console.log(`  ✓ Created user: ${user.email}`);
                        } else {
                            console.log(`  ↪ User already exists: ${user.email}`);
                        }
                        resolve();
                    }
                });
            });
        }

        // Create sample messages
        console.log('💬 Creating sample messages...');
        
        const sampleMessages = [
            {
                from: 'professor@bluemind.net',
                to: 'student1@bluemind.net',
                subject: 'Welcome to Web Development Class',
                body: 'Welcome to our secure web development course! This application demonstrates several key security concepts including password hashing, session management, and input validation. Please explore the features and examine the source code.'
            },
            {
                from: 'professor@bluemind.net',
                to: 'student2@bluemind.net',
                subject: 'Assignment: Security Analysis',
                body: 'For your next assignment, please analyze the security features implemented in this messaging system. Pay special attention to: 1) Password encryption using bcrypt, 2) Session security, 3) Input validation, 4) Rate limiting, and 5) CSRF protection.'
            },
            {
                from: 'admin@bluemind.net',
                to: 'professor@bluemind.net',
                subject: 'System Security Report',
                body: 'The secure messaging system has been implemented with the following security features: encrypted password storage, secure session management, rate limiting for brute force protection, input validation and sanitization, and HTTPS ready configuration.'
            },
            {
                from: 'student1@bluemind.net',
                to: 'student2@bluemind.net',
                subject: 'Study Group - Security Review',
                body: 'Hey! Want to form a study group to review the security implementation? I found the bcrypt hashing and session management particularly interesting. We could go through the code together and understand how each security measure works.'
            }
        ];

        for (const message of sampleMessages) {
            try {
                // Get sender and recipient IDs
                const sender = await new Promise((resolve, reject) => {
                    db.get('SELECT id FROM users WHERE email = ?', [message.from], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });

                const recipient = await new Promise((resolve, reject) => {
                    db.get('SELECT id FROM users WHERE email = ?', [message.to], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });

                if (sender && recipient) {
                    await new Promise((resolve, reject) => {
                        db.run('INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?)',
                               [sender.id, recipient.id, message.subject, message.body], function(err) {
                            if (err) reject(err);
                            else {
                                console.log(`  ✓ Message: ${message.from} → ${message.to}`);
                                resolve();
                            }
                        });
                    });
                }
            } catch (error) {
                console.error(`Error creating message from ${message.from} to ${message.to}:`, error.message);
            }
        }

        console.log('🎉 Database initialization completed successfully!');
        console.log('\n📋 Sample Accounts Created:');
        sampleUsers.forEach(user => {
            console.log(`  👤 ${user.email} | Password: ${user.password}`);
        });
        console.log('\n⚠️  Remember to change these passwords in a production environment!');

    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
}

// Run initialization
initializeDatabase();