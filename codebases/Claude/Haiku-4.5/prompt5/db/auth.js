const bcrypt = require('bcryptjs');
const db = require('./database');

// User authentication and management functions

/**
 * Hash a password using bcrypt
 * SECURITY NOTE: This demonstrates secure password hashing
 */
async function hashPassword(password) {
  const saltRounds = 10; // Number of salt rounds - higher = more secure but slower
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a plain text password with a hash
 * SECURITY NOTE: Use this to verify login attempts
 */
async function verifyPassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

/**
 * Register a new user
 * SECURITY NOTE: Demonstrates secure user creation with hashed passwords
 */
function registerUser(email, password, fullName) {
  return new Promise(async (resolve, reject) => {
    try {
      // Validate inputs
      if (!email || !password || !fullName) {
        return reject(new Error('All fields are required'));
      }

      if (password.length < 8) {
        return reject(new Error('Password must be at least 8 characters long'));
      }

      // Hash the password
      const passwordHash = await hashPassword(password);

      // Insert user into database
      db.run(
        'INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)',
        [email, passwordHash, fullName],
        function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              reject(new Error('Email already registered'));
            } else {
              reject(err);
            }
          } else {
            resolve({ id: this.lastID, email, fullName });
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Authenticate a user by email and password
 * SECURITY NOTE: Demonstrates secure login process
 */
function authenticateUser(email, password) {
  return new Promise(async (resolve, reject) => {
    try {
      db.get(
        'SELECT id, email, full_name, password_hash FROM users WHERE email = ?',
        [email],
        async (err, user) => {
          if (err) {
            reject(err);
          } else if (!user) {
            reject(new Error('User not found'));
          } else {
            // Verify password
            const isPasswordValid = await verifyPassword(password, user.password_hash);
            if (isPasswordValid) {
              // Return user without password hash
              resolve({
                id: user.id,
                email: user.email,
                fullName: user.full_name
              });
            } else {
              reject(new Error('Invalid password'));
            }
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get user by ID
 */
function getUserById(userId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id, email, full_name, created_at FROM users WHERE id = ?',
      [userId],
      (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      }
    );
  });
}

/**
 * Get all users (for message recipient selection)
 */
function getAllUsers() {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT id, email, full_name FROM users ORDER BY full_name',
      (err, users) => {
        if (err) {
          reject(err);
        } else {
          resolve(users || []);
        }
      }
    );
  });
}

module.exports = {
  hashPassword,
  verifyPassword,
  registerUser,
  authenticateUser,
  getUserById,
  getAllUsers
};
