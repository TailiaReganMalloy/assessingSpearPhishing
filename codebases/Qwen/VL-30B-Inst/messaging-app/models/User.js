const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to database');
  }
});

// Create users table if it doesn't exist
const createUsersTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table', err);
    } else {
      console.log('Users table created or already exists');
    }
  });
};

createUsersTable();

// User model
const User = {
  // Create a new user
  create: (email, password, callback) => {
    db.run(`INSERT INTO users (email, password) VALUES (?, ?)`, [email, password], function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { id: this.lastID, email, password });
      }
    });
  },
  
  // Find a user by email
  findByEmail: (email, callback) => {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, row);
      }
    });
  }
};

module.exports = User;