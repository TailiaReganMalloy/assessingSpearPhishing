const bcrypt = require('bcryptjs');
const database = require('./database');

class User {
    constructor() {
        this.db = database.getDb();
    }

    // Create a new user with secure password hashing
    async create(userData) {
        const { email, password, firstName, lastName } = userData;
        
        // Hash password with salt rounds (12 is recommended for educational purposes)
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO users (email, password_hash, first_name, last_name)
                VALUES (?, ?, ?, ?)
            `;
            
            this.db.run(query, [email, passwordHash, firstName, lastName], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        email,
                        firstName,
                        lastName
                    });
                }
            });
        });
    }

    // Find user by email
    async findByEmail(email) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT id, email, password_hash, first_name, last_name, 
                       failed_login_attempts, account_locked_until, is_active
                FROM users 
                WHERE email = ? AND is_active = 1
            `;
            
            this.db.get(query, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Find user by ID
    async findById(id) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT id, email, first_name, last_name, created_at, last_login
                FROM users 
                WHERE id = ? AND is_active = 1
            `;
            
            this.db.get(query, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Verify user password
    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Update last login time
    async updateLastLogin(userId) {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE users 
                SET last_login = CURRENT_TIMESTAMP, failed_login_attempts = 0 
                WHERE id = ?
            `;
            
            this.db.run(query, [userId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    // Increment failed login attempts
    async incrementFailedAttempts(userId) {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE users 
                SET failed_login_attempts = failed_login_attempts + 1,
                    account_locked_until = CASE 
                        WHEN failed_login_attempts >= 4 THEN datetime('now', '+15 minutes')
                        ELSE account_locked_until
                    END
                WHERE id = ?
            `;
            
            this.db.run(query, [userId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    // Check if account is locked
    async isAccountLocked(userId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT account_locked_until 
                FROM users 
                WHERE id = ? AND account_locked_until > datetime('now')
            `;
            
            this.db.get(query, [userId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(!!row);
                }
            });
        });
    }

    // Get all users for messaging purposes (excluding current user)
    async getAllUsers(excludeUserId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT id, email, first_name, last_name
                FROM users 
                WHERE id != ? AND is_active = 1
                ORDER BY first_name, last_name
            `;
            
            this.db.all(query, [excludeUserId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

module.exports = User;