require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const SQLiteStoreFactory = require('connect-sqlite3');
const csurf = require('csurf');
const { getUserById } = require('./db');

const app = express();

// Trust proxy for secure cookies behind reverse proxies if needed
app.set('trust proxy', 1);

// Views and static assets
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use('/static', express.static(path.join(__dirname, '..', 'public')));

// Logging and security headers
app.use(morgan('dev'));
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "data:"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "script-src": ["'self'"]
    }
  }
}));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions with SQLite store (persistent across restarts)
const SQLiteStore = SQLiteStoreFactory(session);
const sessionSecret = process.env.SESSION_SECRET || 'dev_secret_change_me';
app.use(session({
  name: 'sid',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 4 // 4 hours
  },
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: path.join(__dirname, '..', 'data')
  })
}));

// CSRF protection (after sessions)
app.use(csurf());
// Expose CSRF token to views
app.use(async (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.currentUser = null;
  if (req.session.userId) {
    try {
      res.locals.currentUser = await getUserById(req.session.userId);
    } catch {}
  }
  next();
});

// Routes
app.use(require('./routes/auth'));
app.use(require('./routes/messages'));

// Error handler for CSRF errors and general errors
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).render('home', { title: 'Home', error: 'Invalid CSRF token' });
  }
  console.error(err);
  res.status(500).render('home', { title: 'Home', error: 'Something went wrong' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Secure Mailer reference running on http://localhost:${PORT}`);
});
