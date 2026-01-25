const path = require('path');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const expressLayouts = require('express-ejs-layouts');

dotenv.config();

const { db, initDb, getUserByEmail, verifyUserPassword } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

initDb();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'img-src': ["'self'", 'data:'],
      'style-src': ["'self'", "'unsafe-inline'"],
    },
  },
}));

const sessionSecret = process.env.SESSION_SECRET || 'dev-secret-change-me';
app.use(session({
  name: 'sid',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: 1000 * 60 * 60, // 1 hour
  },
}));

// Simple flash messages
app.use((req, res, next) => {
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
});

const csrfProtection = csrf();
app.use(csrfProtection);

// Expose csrf token + user in templates
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.userId = req.session.userId || null;
  next();
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts. Please try again later.',
});

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

app.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/messages');
  res.redirect('/login');
});

// Auth routes
const authRouter = require('./routes/auth')(loginLimiter, getUserByEmail, verifyUserPassword);
app.use(authRouter);

// Message routes
const messagesRouter = require('./routes/messages')(requireAuth, db);
app.use(messagesRouter);

// Error handler for CSRF
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    req.session.flash = { type: 'error', message: 'Invalid CSRF token. Please retry.' };
    return res.redirect('back');
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`Secure Mail demo listening on http://localhost:${PORT}`);
});
