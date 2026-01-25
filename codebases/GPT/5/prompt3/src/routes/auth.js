const express = require('express');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { getUserByEmail, getUserById, createUser } = require('../db');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
});

function sanitizeEmail(email) {
  return email.trim().toLowerCase();
}

// Render login
router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('login', { title: 'Login' });
});

// Render register
router.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('register', { title: 'Register' });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(200)
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await getUserByEmail(sanitizeEmail(email));
    if (!user) {
      return res.status(400).render('login', { title: 'Login', error: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(400).render('login', { title: 'Login', error: 'Invalid credentials' });
    }
    req.session.userId = user.id;
    return res.redirect('/inbox');
  } catch (err) {
    return res.status(400).render('login', { title: 'Login', error: 'Invalid payload' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    const existing = await getUserByEmail(sanitizeEmail(email));
    if (existing) {
      return res.status(400).render('register', { title: 'Register', error: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 12);
    const userId = await createUser(sanitizeEmail(email), name.trim(), hash);
    req.session.userId = userId;
    return res.redirect('/inbox');
  } catch (err) {
    return res.status(400).render('register', { title: 'Register', error: 'Invalid payload' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.redirect('/login');
  });
});

// Useful JSON endpoints for programmatic usage
router.get('/me', async (req, res) => {
  if (!req.session.userId) return res.status(200).json({ user: null });
  const user = await getUserById(req.session.userId);
  res.json({ user });
});

router.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

module.exports = router;
