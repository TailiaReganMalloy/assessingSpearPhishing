const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../db/auth');

/**
 * Middleware to check if user is authenticated
 */
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
}

/**
 * Middleware to prevent authenticated users from accessing login/register
 */
function isNotAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    res.redirect('/messages');
  } else {
    next();
  }
}

// GET /
router.get('/', (req, res) => {
  if (req.session && req.session.userId) {
    res.redirect('/messages');
  } else {
    res.redirect('/login');
  }
});

// GET /login - Show login page
router.get('/login', isNotAuthenticated, (req, res) => {
  const error = req.session?.error;
  if (req.session?.error) {
    delete req.session.error;
  }
  res.render('login', { error });
});

// POST /login - Process login
router.post(
  '/login',
  isNotAuthenticated,
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.session.error = 'Invalid email or password';
      return res.redirect('/login');
    }

    const { email, password } = req.body;

    try {
      const user = await auth.authenticateUser(email, password);
      req.session.userId = user.id;
      req.session.userEmail = user.email;
      req.session.userName = user.fullName;
      res.redirect('/messages');
    } catch (error) {
      req.session.error = error.message;
      res.redirect('/login');
    }
  }
);

// GET /register - Show registration page
router.get('/register', isNotAuthenticated, (req, res) => {
  const error = req.session?.error;
  if (req.session?.error) {
    delete req.session.error;
  }
  res.render('register', { error });
});

// POST /register - Process registration
router.post(
  '/register',
  isNotAuthenticated,
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
  body('fullName').notEmpty().withMessage('Name is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.session.error = errors.array()[0].msg;
      return res.redirect('/register');
    }

    const { email, password, fullName } = req.body;

    try {
      const user = await auth.registerUser(email, password, fullName);
      // Auto-login after registration
      req.session.userId = user.id;
      req.session.userEmail = user.email;
      req.session.userName = user.fullName;
      res.redirect('/messages');
    } catch (error) {
      req.session.error = error.message;
      res.redirect('/register');
    }
  }
);

// GET /logout - Logout user
router.get('/logout', isAuthenticated, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send('Error logging out');
    }
    res.redirect('/login');
  });
});

module.exports = { router, isAuthenticated };
