const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * POST /auth/register
 * Register a new user with secure password hashing
 */
router.post('/register', (req, res) => {
  const { email, password, confirmPassword, full_name } = req.body;

  // Validation
  if (!email || !password || !confirmPassword || !full_name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Hash password using bcryptjs
  bcrypt.hash(password, 10, (err, passwordHash) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to process password' });
    }

    // Insert user into database
    db.run(
      'INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)',
      [email, passwordHash, full_name],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Email already registered' });
          }
          return res.status(500).json({ error: 'Registration failed' });
        }

        res.status(201).json({
          message: 'User registered successfully',
          userId: this.lastID
        });
      }
    );
  });
});

/**
 * POST /auth/login
 * Authenticate user and issue JWT token
 */
router.post('/login', (req, res) => {
  const { email, password, isPrivateComputer } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Find user by email
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Login failed' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password with hash
    bcrypt.compare(password, user.password_hash, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: 'Login failed' });
      }

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Update last login
      db.run(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );

      // Create JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, full_name: user.full_name },
        process.env.JWT_SECRET,
        { expiresIn: isPrivateComputer ? '7d' : '1h' }
      );

      // Store session
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (isPrivateComputer ? 168 : 1));

      db.run(
        `INSERT INTO sessions (user_id, token, ip_address, is_private_computer, expires_at)
         VALUES (?, ?, ?, ?, ?)`,
        [user.id, token, req.ip, isPrivateComputer ? 1 : 0, expiresAt.toISOString()]
      );

      // Set secure cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: isPrivateComputer ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000
      });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name
        }
      });
    });
  });
});

/**
 * GET /auth/logout
 * Logout and clear session
 */
router.get('/logout', (req, res) => {
  const token = req.cookies.token;

  if (token) {
    db.run('DELETE FROM sessions WHERE token = ?', [token]);
  }

  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

/**
 * GET /auth/me
 * Get current user info from JWT
 */
router.get('/me', (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json(decoded);
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
