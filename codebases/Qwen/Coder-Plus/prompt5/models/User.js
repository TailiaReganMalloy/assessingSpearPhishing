const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

class User {
  constructor(id, username, passwordHash, createdAt) {
    this.id = id;
    this.username = username;
    this.passwordHash = passwordHash;
    this.createdAt = createdAt;
  }

  static initializeDB() {
    this.db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'));
    
    const createUserTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    this.db.run(createUserTable, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      } else {
        console.log('Users table ready');
      }
    });
  }

  static async create(username, password) {
    try {
      const passwordHash = await bcrypt.hash(password, 12);
      
      return new Promise((resolve, reject) => {
        const stmt = this.db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
        stmt.run([username, passwordHash], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(new User(this.lastID, username, passwordHash));
          }
        });
        stmt.finalize();
      });
    } catch (error) {
      throw error;
    }
  }

  static async findByUsername(username) {
    // Sanitize input to prevent SQL injection
    const sanitizedUsername = username.replace(/[^a-zA-Z0-9_\-]/g, '');
    
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE username = ?', [sanitizedUsername], (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row) {
            resolve(new User(row.id, row.username, row.password_hash, row.created_at));
          } else {
            resolve(null);
          }
        }
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row) {
            resolve(new User(row.id, row.username, row.password_hash, row.created_at));
          } else {
            resolve(null);
          }
        }
      });
    });
  }

  async validatePassword(password) {
    return await bcrypt.compare(password, this.passwordHash);
  }
}

module.exports = User;