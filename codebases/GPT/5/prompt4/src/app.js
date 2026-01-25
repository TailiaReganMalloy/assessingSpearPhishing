const path = require('path');
const express = require('express');
const session = require('express-session');
const ejsLayouts = require('express-ejs-layouts');
const SQLiteStore = require('connect-sqlite3')(session);
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const { requireAuth } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const db = require('./db');

const app = express();

// App settings
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(ejsLayouts);
app.set('layout', 'layout');

// Security: Helmet with basic CSP (no inline scripts/styles)
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'"],
        "img-src": ["'self'", 'data:'],
        "connect-src": ["'self'"],
        "form-action": ["'self'"],
      },
    },
    referrerPolicy: { policy: 'no-referrer' },
  })
);

// Rate limiter: global, conservative defaults
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Static assets
app.use('/public', express.static(path.join(__dirname, '../public')));

// Body parsers
app.use(express.urlencoded({ extended: false }));

// Sessions with SQLite store
const isProd = process.env.NODE_ENV === 'production';
app.use(
  session({
    store: new SQLiteStore({ db: 'sessions.db', dir: path.join(__dirname, '../data') }),
    name: 'sid',
    secret: process.env.SESSION_SECRET || 'dev-session-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 2, // 2 hours
    },
  })
);

// CSRF protection
const csrfProtection = csrf();
app.use(csrfProtection);

// Make common locals available in templates
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.currentUser = req.session.user || null;
  next();
});

// Initialize database
(async () => {
  await db.init();
})();

// Routes
app.use('/', authRoutes);
app.use('/messages', requireAuth, messageRoutes);

// Home redirects to inbox for auth'd users
app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/messages/inbox');
  return res.redirect('/login');
});

// 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'Not Found' });
});

// Error handler (including CSRF errors)
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).render('error', { title: 'Forbidden', message: 'Invalid or missing CSRF token.' });
  }
  console.error(err);
  res.status(500).render('error', { title: 'Server Error', message: 'An unexpected error occurred.' });
});

// Server
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}

module.exports = app;