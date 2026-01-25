require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const helmet = require('helmet');
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');

const db = require('./db');

const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "img-src": ["'self'", 'data:'],
      "script-src": ["'self'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "form-action": ["'self'"]
    }
  }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Ensure session DB directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Sessions with SQLite store
app.use(
  session({
    store: new SQLiteStore({ db: 'sessions.sqlite', dir: dataDir }),
    secret: process.env.SESSION_SECRET || 'dev-session-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      maxAge: 1000 * 60 * 60 * 8 // 8 hours
    }
  })
);

// CSRF protection
app.use(csrf());

// Rate limit auth endpoints
const authLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 100 });
app.use(['/login', '/register'], authLimiter);

// Locals for templates
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/inbox');
  res.redirect('/login');
});

app.use(authRoutes);
app.use(messageRoutes);

// 404
app.use((req, res) => {
  res.status(404).render('layout', {
    title: 'Not Found',
    body: '<div class="container"><h1>404</h1><p>Page not found.</p></div>'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.code === 'EBADCSRFTOKEN' ? 403 : 500;
  const msg = err.code === 'EBADCSRFTOKEN' ? 'Invalid CSRF token' : 'Something went wrong';
  res.status(status).render('layout', {
    title: 'Error',
    body: `<div class="container"><h1>${status}</h1><p>${msg}</p></div>`
  });
});

// Initialize DB and start server
(async () => {
  await db.init();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})();
