"use strict";

const sqlite3 = require('sqlite3').verbose();

class Message {
    // Create a new message
    static create(senderId, receiverId, content, callback) {
        const db = new sqlite3.Database('./database.sqlite');
        
        db.run(
            'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
            [senderId, receiverId, content],
            function(err) {
                db.close();
                if (err) return callback(err);
                callback(null, this.lastID);
            }
        );
    }
    
    // Get messages for a user
    static getForUser(userId, callback) {
        const db = new sqlite3.Database('./database.sqlite');
        
        db.all(
            `SELECT m.*, u.email as sender_email
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             WHERE m.receiver_id = ?
             ORDER BY m.created_at DESC`,
            [userId],
            (err, rows) => {
                db.close();
                if (err) return callback(err);
                callback(null, rows);
            }
        );
    }
    
    // Get all users except the current one (for messaging)
    static getAllUsersExcept(currentUserId, callback) {
        const db = new sqlite3.Database('./database.sqlite');
        
        db.all(
            'SELECT id, email FROM users WHERE id != ? ORDER BY email',
            [currentUserId],
            (err, rows) => {
                db.close();
                if (err) return callback(err);
                callback(null, rows);
            }
        );
    }
}

module.exports = Message;