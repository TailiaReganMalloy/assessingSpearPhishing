const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const router = express.Router();

const SALT_ROUNDS = 10; // Cost factor for bcrypt

/**
 * POST /api/auth/register
 * Create a new user account with secure password hashing
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Validation
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        error: 'Passwords do not match' 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await db.get(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return res.status(409).json({ 
        error: 'Email already registered' 
      });
    }

    // Hash the password with bcrypt
    // IMPORTANT: Never store plain-text passwords!
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert new user
    const result = await db.run(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, passwordHash]
    );

    // Create session
    req.session.userId = result.lastID;
    req.session.email = email;

    return res.status(201).json({ 
      message: 'User registered successfully',
      userId: result.lastID,
      email: email
    });

  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ 
      error: 'Server error during registration' 
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, isPrivateComputer } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await db.get(
      'SELECT id, email, password_hash FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      // Don't reveal whether email exists for security
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Compare provided password with stored hash using bcrypt
    // IMPORTANT: Use bcrypt.compare() to safely verify passwords
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Successful login - create session
    req.session.userId = user.id;
    req.session.email = user.email;

    // If public computer selected, set shorter session timeout
    if (isPrivateComputer === false) {
      req.session.cookie.maxAge = 30 * 60 * 1000; // 30 minutes
    }

    return res.json({ 
      message: 'Login successful',
      userId: user.id,
      email: user.email
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ 
      error: 'Server error during login' 
    });
  }
});

/**
 * POST /api/auth/logout
 * Destroy the session
 */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Logout failed' 
      });
    }
    return res.json({ 
      message: 'Logged out successfully' 
    });
  });
});

/**
 * GET /api/auth/me
 * Get current logged-in user info
 */
router.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      error: 'Not authenticated' 
    });
  }

  return res.json({
    userId: req.session.userId,
    email: req.session.email
  });
});

module.exports = router;
