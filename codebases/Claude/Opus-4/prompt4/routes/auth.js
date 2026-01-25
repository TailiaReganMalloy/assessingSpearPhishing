const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');

// Middleware to log login attempts
const logLoginAttempt = (email, success, ipAddress, userAgent) => {
  db.run(
    "INSERT INTO login_attempts (email, success, ip_address, user_agent) VALUES (?, ?, ?, ?)",
    [email, success, ipAddress, userAgent],
    (err) => {
      if (err) console.error('Error logging login attempt:', err);
    }
  );
};

// Login endpoint with security best practices
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  body('rememberMe').isBoolean().optional()
], async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, rememberMe } = req.body;
  const ipAddress = req.ip;
  const userAgent = req.get('user-agent');

  try {
    // Check if user exists and get their details
    db.get(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, user) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (!user) {
          logLoginAttempt(email, false, ipAddress, userAgent);
          // Don't reveal whether email exists
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if account is locked
        if (user.locked_until && new Date(user.locked_until) > new Date()) {
          logLoginAttempt(email, false, ipAddress, userAgent);
          return res.status(401).json({ 
            error: 'Account is locked due to multiple failed login attempts. Please try again later.' 
          });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
          // Increment failed attempts
          const newFailedAttempts = user.failed_attempts + 1;
          let lockedUntil = null;

          // Lock account after 5 failed attempts for 30 minutes
          if (newFailedAttempts >= 5) {
            lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
          }

          db.run(
            "UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?",
            [newFailedAttempts, lockedUntil, user.id],
            (err) => {
              if (err) console.error('Error updating failed attempts:', err);
            }
          );

          logLoginAttempt(email, false, ipAddress, userAgent);
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Successful login - reset failed attempts and update last login
        db.run(
          "UPDATE users SET failed_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP WHERE id = ?",
          [user.id],
          (err) => {
            if (err) console.error('Error updating user login info:', err);
          }
        );

        logLoginAttempt(email, true, ipAddress, userAgent);

        // Create JWT token
        const tokenExpiry = rememberMe ? '7d' : '24h';
        const token = jwt.sign(
          { 
            userId: user.id, 
            email: user.email 
          },
          process.env.JWT_SECRET,
          { 
            expiresIn: tokenExpiry,
            issuer: 'secure-messaging-demo'
          }
        );

        // Set secure cookie
        res.cookie('authToken', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
        });

        res.json({ 
          success: true, 
          user: { 
            id: user.id, 
            email: user.email 
          }
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.json({ success: true });
});

// Register endpoint (for demo purposes - with input validation)
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user already exists
    db.get("SELECT id FROM users WHERE email = ?", [email], async (err, existingUser) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      db.run(
        "INSERT INTO users (email, password_hash) VALUES (?, ?)",
        [email, hashedPassword],
        function(err) {
          if (err) {
            console.error('Error creating user:', err);
            return res.status(500).json({ error: 'Error creating user' });
          }

          res.status(201).json({ 
            success: true, 
            message: 'User created successfully',
            userId: this.lastID 
          });
        }
      );
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  });
};

// Check authentication status
router.get('/status', authenticateToken, (req, res) => {
  res.json({ 
    authenticated: true, 
    user: { 
      id: req.user.userId, 
      email: req.user.email 
    } 
  });
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;