// routes/auth.js - Secure authentication routes
// Demonstrates: bcrypt for secure password hashing (automatic salting), express-validator for input sanitization,
// JWT for stateless authentication, rate limiting (applied in server.js)

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey-change-in-prod'; // EDUCATIONAL: Use strong, env-based secret!

// POST /api/auth/register
// SECURITY: Validates/sanitizes input, hashes password with salt (bcrypt.genSaltSync(12) implicit), checks uniqueness
router.post('/register', [
  body('username').isLength({ min: 3, max: 20 }).trim().escape().withMessage('Username 3-20 chars'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 chars'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    // Hash password securely: bcrypt uses unique salt per hash, slow computation resists brute force
    const password_hash = await bcrypt.hash(password, 12);
    
    db.run(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, password_hash],
      function (err) {
        if (err) {
          // Handle constraint violations gracefully
          if (err.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'Username or email already exists' });
          }
          console.error(err);
          return res.status(500).json({ error: 'Registration failed' });
        }
        res.status(201).json({ message: 'User registered successfully' });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
// SECURITY: Never reveals if user exists (use same response for bad pw/missing user), bcrypt.compare is timing-safe
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  db.get('SELECT id, username, password_hash FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) {
      // Generic error: prevents username enumeration
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Issue JWT: contains minimal user info, expires, signed with secret
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username }
    });
  });
});

module.exports = router;
