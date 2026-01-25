const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const db = require('../db');

const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/messages/inbox');
  res.render('login', { title: 'Login', error: null });
});

router.post(
  '/login',
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('login', { title: 'Login', error: errors.array()[0].msg });
    }
    const { email, password } = req.body;
    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).render('login', { title: 'Login', error: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).render('login', { title: 'Login', error: 'Invalid credentials' });
    }
    req.session.user = { id: user.id, email: user.email };
    res.redirect('/messages/inbox');
  }
);

router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/messages/inbox');
  res.render('register', { title: 'Register', error: null });
});

router.post(
  '/register',
  body('email').isEmail().withMessage('Valid email required'),
  body('password')
    .isStrongPassword({ minLength: 8, minSymbols: 1, minNumbers: 1 })
    .withMessage('Password must be strong (8+ chars, numbers & symbols)'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('register', { title: 'Register', error: errors.array()[0].msg });
    }
    const { email, password } = req.body;
    try {
      const existing = await db.findUserByEmail(email);
      if (existing) return res.status(400).render('register', { title: 'Register', error: 'Email already registered' });
      await db.createUser(email, password);
      return res.redirect('/login');
    } catch (e) {
      console.error(e);
      return res.status(500).render('register', { title: 'Register', error: 'Server error, try again.' });
    }
  }
);

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.redirect('/login');
  });
});

module.exports = router;