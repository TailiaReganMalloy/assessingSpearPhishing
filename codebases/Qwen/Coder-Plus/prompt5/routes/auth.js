const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Login page
router.get('/login', (req, res) => {
  res.render('login', { 
    title: 'BlueMind v5 - Login',
    errorMessage: req.flash('error'),
    successMessage: req.flash('success')
  });
});

// Handle login
router.post('/login', [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .escape(),
  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/auth/login');
  }
  
  try {
    const { username, password, computerType } = req.body;
    
    // Find user by username
    const user = await User.findByUsername(username);
    
    if (!user || !await user.validatePassword(password)) {
      req.flash('error', 'Invalid username or password');
      return res.redirect('/auth/login');
    }
    
    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;
    
    // Set session timeout based on computer type
    if (computerType === 'public') {
      // Shorter timeout for public computers
      req.session.cookie.maxAge = 30 * 60 * 1000; // 30 minutes
    } else {
      // Default timeout for private computers
      req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours
    }
    
    req.flash('success', 'Login successful!');
    res.redirect('/messages');
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error', 'An error occurred during login');
    res.redirect('/auth/login');
  }
});

// Registration page
router.get('/register', (req, res) => {
  res.render('register', { 
    title: 'BlueMind v5 - Register',
    errorMessage: req.flash('error'),
    successMessage: req.flash('success')
  });
});

// Handle registration
router.post('/register', [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .isAlphanumeric()
    .withMessage('Username must contain only letters and numbers')
    .escape(),
  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword')
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/auth/register');
  }
  
  try {
    const { username, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      req.flash('error', 'Username already taken');
      return res.redirect('/auth/register');
    }
    
    // Create new user
    await User.create(username, password);
    
    req.flash('success', 'Registration successful! Please log in.');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error);
    req.flash('error', 'An error occurred during registration');
    res.redirect('/auth/register');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }
    res.redirect('/auth/login');
  });
});

module.exports = router;