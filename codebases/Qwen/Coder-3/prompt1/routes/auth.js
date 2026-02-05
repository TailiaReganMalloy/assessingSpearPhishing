const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

// Render login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Handle login form submission
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('login', { 
      errors: errors.array(),
      username: req.body.username
    });
  }

  const { username, password, computerType } = req.body;

  try {
    // Find user by username
    const user = User.findByUsername(username);
    if (!user) {
      return res.render('login', {
        errors: [{ msg: 'Invalid credentials' }],
        username
      });
    }

    // Validate password
    const isMatch = await User.validatePassword(password, user.password);
    if (!isMatch) {
      return res.render('login', {
        errors: [{ msg: 'Invalid credentials' }]
      });
    }

    // Set session
    req.session.userId = user.id;
    
    // Set session expiration based on computer type
    if (computerType === 'public') {
      // Shorter session for public computers
      req.session.cookie.maxAge = 30 * 60 * 1000; // 30 minutes
    } else {
      // Longer session for private computers
      req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours
    }

    // Redirect to messages page
    res.redirect('/messages');
  } catch (err) {
    console.error(err);
    res.render('login', {
      errors: [{ msg: 'Server error' }]
    });
  }
});

// Render registration page
router.get('/register', (req, res) => {
  res.render('register');
});

// Handle registration form submission
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('register', { 
      errors: errors.array(),
      username: req.body.username
    });
  }

  const { username, password } = req.body;

  try {
    // Check if user already exists
    let user = User.findByUsername(username);
    if (user) {
      return res.render('register', {
        errors: [{ msg: 'User already exists' }],
        username
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User(
      Date.now().toString(),
      username,
      hashedPassword,
      new Date()
    );
    
    // Save user
    newUser.save();

    // Set session
    req.session.userId = newUser.id;

    // Redirect to messages page
    res.redirect('/messages');
  } catch (err) {
    console.error(err);
    res.render('register', {
      errors: [{ msg: 'Server error' }]
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/messages');
    }
    res.clearCookie('connect.sid');
    res.redirect('/auth/login');
  });
});

module.exports = router;