require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const csurf = require('csurf');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rate limiter for auth endpoints
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: 'Too many attempts, try again later.' });

app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: '.' }),
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // set true in prod with HTTPS
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(csurf());

// Helpers
function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Routes
app.get('/', (req, res) => res.redirect(req.session.userId ? '/inbox' : '/login'));

app.get('/login', (req, res) => res.render('login', { errors: [] }));

app.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).render('login', { errors: errors.array() });

  const { email, password } = req.body;
  db.get('SELECT id, password_hash FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).render('login', { errors: [{ msg: 'Invalid email or password' }] });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).render('login', { errors: [{ msg: 'Invalid email or password' }] });

    req.session.userId = user.id;
    res.redirect('/inbox');
  });
});

app.get('/register', (req, res) => res.render('register', { errors: [] }));

app.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).render('register', { errors: errors.array() });

  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 12);
  db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, hash], function (err) {
    if (err) {
      if (err.message && err.message.includes('UNIQUE')) return res.status(400).render('register', { errors: [{ msg: 'Email already exists' }] });
      return next(err);
    }
    req.session.userId = this.lastID;
    res.redirect('/inbox');
  });
});

app.get('/inbox', requireAuth, (req, res, next) => {
  const uid = req.session.userId;
  db.all(
    `SELECT m.id, m.body, m.created_at, s.email AS sender_email
     FROM messages m
     JOIN users s ON s.id = m.sender_id
     WHERE m.recipient_id = ?
     ORDER BY m.created_at DESC`,
    [uid], (err, rows) => {
      if (err) return next(err);
      res.render('inbox', { messages: rows, errors: [] });
    }
  );
});

app.post('/message', requireAuth, [body('to').isEmail(), body('body').isLength({ min: 1, max: 2000 })], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).render('inbox', { messages: [], errors: errors.array() });

  const { to, body: bodyText } = req.body;
  db.get('SELECT id FROM users WHERE email = ?', [to], (err, recipient) => {
    if (err) return next(err);
    if (!recipient) return res.status(400).render('inbox', { messages: [], errors: [{ msg: 'Recipient not found' }] });

    db.run('INSERT INTO messages (sender_id, recipient_id, body) VALUES (?, ?, ?)', [req.session.userId, recipient.id, bodyText], (err) => {
      if (err) return next(err);
      res.redirect('/inbox');
    });
  });
});

app.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.redirect('/login');
  });
});

// Simple error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('An error occurred');
});

app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
