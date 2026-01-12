const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const db = require('../db');

const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/inbox');
  res.render('login', { title: 'Login' });
});

router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/inbox');
  res.render('register', { title: 'Register' });
});

const validateUser = [
  body('username').trim().isLength({ min: 3, max: 32 }).withMessage('Username 3-32 chars').matches(/^[a-zA-Z0-9_]+$/).withMessage('Alphanumeric + underscore only'),
  body('password').isLength({ min: 8 }).withMessage('Password at least 8 chars')
];

router.post('/register', validateUser, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('register', { title: 'Register', errors: errors.array() });
    }
    const { username, password } = req.body;
    const existing = await db.get('SELECT id FROM users WHERE username = ?', [username]);
    if (existing) {
      return res.status(400).render('register', { title: 'Register', errors: [{ msg: 'Username already taken' }] });
    }
    const hash = await bcrypt.hash(password, 12);
    const result = await db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hash]);
    req.session.user = { id: result.lastID, username };
    res.redirect('/inbox');
  } catch (err) { next(err); }
});

router.post('/login', [
  body('username').trim().notEmpty(),
  body('password').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('login', { title: 'Login', errors: errors.array() });
    }
    const { username, password } = req.body;
    const user = await db.get('SELECT id, password_hash FROM users WHERE username = ?', [username]);
    if (!user) return res.status(401).render('login', { title: 'Login', errors: [{ msg: 'Invalid credentials' }] });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).render('login', { title: 'Login', errors: [{ msg: 'Invalid credentials' }] });

    req.session.user = { id: user.id, username };
    res.redirect('/inbox');
  } catch (err) { next(err); }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

module.exports = router;
