"use strict";

const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const securityConfig = require('../config/security');

class User {
    // Create a new user
    static create(email, password, callback) {
        const db = new sqlite3.Database('./database.sqlite');
        
        bcrypt.hash(password, securityConfig.password.saltRounds, (err, hashedPassword) => {
            if (err) {
                db.close();
                return callback(err);
            }
            
            db.run(
                'INSERT INTO users (email, password) VALUES (?, ?)',
                [email, hashedPassword],
                function(err) {
                    db.close();
                    if (err) {
                        if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE')) {
                            return callback(new Error('Email already exists'));
                        }
                        return callback(err);
                    }
                    callback(null, this.lastID);
                }
            );
        });
    }
    
    // Find user by email
    static findByEmail(email, callback) {
        const db = new sqlite3.Database('./database.sqlite');
        
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
            db.close();
            if (err) return callback(err);
            callback(null, row);
        });
    }
    
    // Find user by ID
    static findById(id, callback) {
        const db = new sqlite3.Database('./database.sqlite');
        
        db.get('SELECT id, email, created_at FROM users WHERE id = ?', [id], (err, row) => {
            db.close();
            if (err) return callback(err);
            callback(null, row);
        });
    }
    
    // Verify password
    static verifyPassword(user, password, callback) {
        if (!user || !user.password) {
            return callback(null, false);
        }
        bcrypt.compare(password, user.password, callback);
    }
}

module.exports = User;