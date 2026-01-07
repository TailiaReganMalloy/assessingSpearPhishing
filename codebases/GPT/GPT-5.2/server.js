require('dotenv').config();

const path = require('path');
const crypto = require('crypto');

const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const morgan = require('morgan');
const engine = require('ejs-mate');

const { openDb, migrate, get } = require('./db');

const authRoutes = require('./src/routes/auth');
const messageRoutes = require('./src/routes/messages');

const app = express();

const PORT = Number(process.env.PORT || 3000);
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET || SESSION_SECRET.length < 24) {
  // Instructor-friendly error: secure-by-default.
  console.error('Missing/weak SESSION_SECRET. Copy .env.example to .env and set SESSION_SECRET to a long random string.');
  process.exit(1);
}

const db = openDb();
migrate(db).catch((err) => {
  console.error('DB migration failed:', err);
  process.exit(1);
});

app.set('view engine', 'ejs');
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));

app.use(morgan('dev'));
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        // EJS inline styles are avoided; keep strict defaults.
      }
    }
  })
);

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: false, limit: '20kb' }));

app.use(
  session({
    name: 'bm_session',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({
      db: 'sessions.sqlite',
      dir: __dirname
    }),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // set true behind HTTPS in production
      maxAge: 1000 * 60 * 60 * 4
    }
  })
);

// Basic global rate limiting (demo-friendly)
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: 'draft-7',
    legacyHeaders: false
  })
);

// CSRF after session
app.use(csrf());

// Make csrf token + user available to all templates
app.use(async (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.currentUser = null;

  if (req.session.userId) {
    try {
      const user = await get(db, 'SELECT id, email FROM users WHERE id = ?', [req.session.userId]);
      if (user) res.locals.currentUser = user;
    } catch {
      // ignore; treat as logged out
    }
  }

  // Nonce for any future inline scripts (not used by default)
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});

app.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/inbox');
  return res.redirect('/login');
});

app.use(authRoutes({ db }));
app.use(messageRoutes({ db }));

// CSRF errors -> friendly error
app.use((err, req, res, next) => {
  if (err && err.code === 'EBADCSRFTOKEN') {
    return res.status(403).render('error', {
      title: 'Security Check Failed',
      message: 'Your form expired. Please go back and try again.'
    });
  }
  return next(err);
});

app.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).render('error', {
    title: 'Server Error',
    message: 'Something went wrong.'
  });
});

app.listen(PORT, () => {
  console.log(`Demo mailer running on http://localhost:${PORT}`);
});
