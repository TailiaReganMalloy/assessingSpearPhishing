const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// Login page
router.get('/', csrfProtection, (req, res) => {
  res.render('login', {
    csrfToken: req.csrfToken(),
    errors: null,
    email: ''
  });
});

// Login POST
router.post('/login', csrfProtection, [
  check('email').isEmail().normalizeEmail(),
  check('password').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('login', {
      csrfToken: req.csrfToken(),
      errors: errors.array(),
      email: req.body.email
    });
  }
  
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.render('login', {
        csrfToken: req.csrfToken(),
        errors: [{ msg: 'Invalid credentials' }],
        email
      });
    }
    
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.render('login', {
        csrfToken: req.csrfToken(),
        errors: [{ msg: 'Invalid credentials' }],
        email
      });
    }
    
    // Set session
    req.session.userId = user._id;
    req.session.email = user.email;
    
    res.redirect('/messages');
  } catch (error) {
    console.error(error);
    res.render('login', {
      csrfToken: req.csrfToken(),
      errors: [{ msg: 'Server error' }],
      email: req.body.email
    });
  }
});

// Register page
router.get('/register', csrfProtection, (req, res) => {
  res.render('register', {
    csrfToken: req.csrfToken(),
    errors: null,
    email: ''
  });
});

// Register POST
router.post('/register', csrfProtection, [
  check('email').isEmail().normalizeEmail(),
  check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  check('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('register', {
      csrfToken: req.csrfToken(),
      errors: errors.array(),
      email: req.body.email
    });
  }
  
  try {
    const { email, password } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.render('register', {
        csrfToken: req.csrfToken(),
        errors: [{ msg: 'User already exists' }],
        email
      });
    }
    
    // Create new user
    user = new User({ email, password });
    await user.save();
    
    // Set session
    req.session.userId = user._id;
    req.session.email = user.email;
    
    res.redirect('/messages');
  } catch (error) {
    console.error(error);
    res.render('register', {
      csrfToken: req.csrfToken(),
      errors: [{ msg: 'Server error' }],
      email: req.body.email
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});

module.exports = router;