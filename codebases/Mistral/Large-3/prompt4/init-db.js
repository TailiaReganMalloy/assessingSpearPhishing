"use strict";

const sqlite3 = require('sqlite3').verbose();

// Initialize database
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
    }
    
    // Create users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
        if (err) {
            console.error('Error creating users table:', err);
            process.exit(1);
        }
        
        // Create messages table
        db.run(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_id INTEGER NOT NULL,
                receiver_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users(id),
                FOREIGN KEY (receiver_id) REFERENCES users(id)
            )`, (err) => {
            if (err) {
                console.error('Error creating messages table:', err);
                process.exit(1);
            }
            
            console.log('Database initialized successfully');
            db.close();
            process.exit(0);
        });
    });
});