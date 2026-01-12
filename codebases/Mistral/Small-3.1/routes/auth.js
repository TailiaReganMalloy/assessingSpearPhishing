const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../models/database');
const { requireLogin, redirectIfLoggedIn } = require('../middleware/auth');

const router = express.Router();
const SALT_ROUNDS = 10;

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Input validation
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user already exists
    db.getUserByEmail(email, async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (user) {
        return res.status(409).json({ error: 'User already exists' });
      }

      try {
        // Hash password with bcrypt
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        db.createUser(email, hashedPassword, (err, userId) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' });
          }

          // Set session
          req.session.userId = userId;
          req.session.email = email;

          res.json({ message: 'User registered successfully', userId });
        });
      } catch (hashErr) {
        res.status(500).json({ error: 'Password hashing failed' });
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Look up user
    db.getUserByEmail(email, async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        // SECURITY: Don't reveal if email exists (prevents user enumeration)
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      try {
        // Compare password with hash
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Set session
        req.session.userId = user.id;
        req.session.email = user.email;

        res.json({ message: 'Login successful', userId: user.id, email: user.email });
      } catch (compareErr) {
        res.status(500).json({ error: 'Login failed' });
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user info
router.get('/user', requireLogin, (req, res) => {
  db.getUserById(req.session.userId, (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  });
});

// Logout
router.post('/logout', requireLogin, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get all users (for sending messages to)
router.get('/users', requireLogin, (req, res) => {
  db.getAllUsers((err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Filter out current user
    const otherUsers = users.filter(u => u.id !== req.session.userId);
    res.json(otherUsers);
  });
});

module.exports = router;
