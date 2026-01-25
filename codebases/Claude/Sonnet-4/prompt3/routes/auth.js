const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { redirectIfAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// Login page
router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('login', { title: 'BlueMind v5 - Login' });
});

// Register page
router.get('/register', redirectIfAuthenticated, (req, res) => {
  res.render('register', { title: 'BlueMind v5 - Register' });
});

// Login validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required'),
];

// Register validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

// Login POST
router.post('/login', authLimiter, loginValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/auth/login');
  }

  const { email, password, computer_type } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');

  try {
    db.getUserByEmail(email, async (err, user) => {
      if (err) {
        console.error('Database error:', err);
        req.flash('error', 'An error occurred. Please try again.');
        return res.redirect('/auth/login');
      }

      // Check if user exists
      if (!user) {
        // Log failed attempt
        db.logLoginAttempt(email, ipAddress, userAgent, false, () => {});
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/auth/login');
      }

      // Check if account is locked
      if (user.locked_until && new Date() < new Date(user.locked_until)) {
        req.flash('error', 'Account temporarily locked due to too many failed attempts. Please try again later.');
        return res.redirect('/auth/login');
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isValid) {
        // Increment failed attempts
        const newAttempts = user.failed_login_attempts + 1;
        const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
        const lockoutMinutes = parseInt(process.env.LOGIN_COOLDOWN_MINUTES) || 15;
        
        let lockUntil = null;
        if (newAttempts >= maxAttempts) {
          lockUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000).toISOString();
        }

        db.updateUserLoginAttempts(email, newAttempts, lockUntil, () => {});
        db.logLoginAttempt(email, ipAddress, userAgent, false, () => {});
        
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/auth/login');
      }

      // Successful login
      db.updateLastLogin(user.id, () => {});
      db.logLoginAttempt(email, ipAddress, userAgent, true, () => {});
      
      // Set session
      req.session.user = {
        id: user.id,
        email: user.email,
        computer_type: computer_type || 'public'
      };

      // Set session expiry based on computer type
      if (computer_type === 'private') {
        req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      } else {
        req.session.cookie.maxAge = 2 * 60 * 60 * 1000; // 2 hours
      }

      req.flash('success', 'Successfully logged in!');
      res.redirect('/messages');
    });
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error', 'An error occurred. Please try again.');
    res.redirect('/auth/login');
  }
});

// Register POST
router.post('/register', authLimiter, registerValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/auth/register');
  }

  const { email, password } = req.body;

  try {
    // Check if user already exists
    db.getUserByEmail(email, async (err, existingUser) => {
      if (err) {
        console.error('Database error:', err);
        req.flash('error', 'An error occurred. Please try again.');
        return res.redirect('/auth/register');
      }

      if (existingUser) {
        req.flash('error', 'An account with this email already exists.');
        return res.redirect('/auth/register');
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      db.createUser(email, passwordHash, function(err) {
        if (err) {
          console.error('Error creating user:', err);
          req.flash('error', 'Failed to create account. Please try again.');
          return res.redirect('/auth/register');
        }

        req.flash('success', 'Account created successfully! Please log in.');
        res.redirect('/auth/login');
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    req.flash('error', 'An error occurred. Please try again.');
    res.redirect('/auth/register');
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/auth/login');
  });
});

module.exports = router;