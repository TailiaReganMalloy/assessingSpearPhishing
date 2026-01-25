import express from 'express';
import bcrypt from 'bcryptjs';
import csrf from 'csurf';
import { initDB, getUserByEmail, createUser } from '../db.js';
import { registerSchema, loginSchema } from '../validators.js';

const router = express.Router();
const csrfProtection = csrf();

router.get('/login', csrfProtection, (req, res) => {
  res.render('login', { csrfToken: req.csrfToken(), error: req.flash('error') });
});

router.post('/login', csrfProtection, express.urlencoded({ extended: false }), async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    req.flash('error', 'Invalid credentials');
    return res.redirect('/login');
  }

  const db = await initDB();
  const user = await getUserByEmail(db, parse.data.email);
  if (!user) {
    req.flash('error', 'Invalid credentials');
    return res.redirect('/login');
  }

  const ok = await bcrypt.compare(parse.data.password, user.password_hash);
  if (!ok) {
    req.flash('error', 'Invalid credentials');
    return res.redirect('/login');
  }

  req.session.user = { id: user.id, email: user.email, name: user.name };
  res.redirect('/');
});

router.get('/register', csrfProtection, (req, res) => {
  res.render('register', { csrfToken: req.csrfToken(), error: req.flash('error') });
});

router.post('/register', csrfProtection, express.urlencoded({ extended: false }), async (req, res) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) {
    req.flash('error', 'Please check your inputs');
    return res.redirect('/register');
  }

  const db = await initDB();
  const existing = await getUserByEmail(db, parse.data.email);
  if (existing) {
    req.flash('error', 'Email already registered');
    return res.redirect('/register');
  }

  const hash = await bcrypt.hash(parse.data.password, 12);
  const user = await createUser(db, {
    email: parse.data.email,
    name: parse.data.name,
    password_hash: hash,
  });

  req.session.user = { id: user.id, email: user.email, name: user.name };
  res.redirect('/');
});

router.post('/logout', csrfProtection, (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.redirect('/login');
  });
});

export default router;
