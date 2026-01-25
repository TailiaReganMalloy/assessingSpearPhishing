require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const csrf = require('csurf');
const bcrypt = require('bcrypt');

const {
  findUserByEmail,
  getInboxMessages
} = require('./db');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"]
      }
    },
    referrerPolicy: { policy: 'no-referrer' }
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(
  session({
    store: new SQLiteStore({
      dir: path.join(__dirname, '..', 'data'),
      db: 'sessions.sqlite'
    }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 30
    }
  })
);

app.use(csrf());

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.currentUser = req.session.user || null;
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.session.flash = {
      type: 'error',
      message: 'Log in to view your inbox.'
    };
    return res.redirect('/login');
  }
  next();
}

app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/inbox');
  }
  return res.redirect('/login');
});

app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/inbox');
  }
  res.render('login', { pageTitle: 'Identify yourself', flash: res.locals.flash });
});

app.post('/login', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';
  const deviceType = req.body.deviceType || 'private';

  if (!email || !password) {
    req.session.flash = {
      type: 'error',
      message: 'Email and password are required.'
    };
    return res.redirect('/login');
  }

  try {
    const user = findUserByEmail(email);
    if (!user) {
      req.session.flash = {
        type: 'error',
        message: 'Invalid credentials.'
      };
      return res.redirect('/login');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      req.session.flash = {
        type: 'error',
        message: 'Invalid credentials.'
      };
      return res.redirect('/login');
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      deviceType
    };
    return res.redirect('/inbox');
  } catch (error) {
    console.error('Login error', error);
    req.session.flash = {
      type: 'error',
      message: 'Unexpected error. Please try again.'
    };
    return res.redirect('/login');
  }
});

app.get('/inbox', requireAuth, (req, res) => {
  const messages = getInboxMessages(req.session.user.id);
  res.render('inbox', {
    pageTitle: 'Inbox',
    messages
  });
});

app.post('/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error', err);
    }
    res.redirect('/login');
  });
});

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    console.warn('CSRF token mismatch');
    if (typeof req.csrfToken === 'function') {
      res.locals.csrfToken = req.csrfToken();
    }
    return res.status(403).render('login', {
      pageTitle: 'Session expired',
      flash: {
        type: 'error',
        message: 'Security token expired. Please try again.'
      }
    });
  }

  console.error(err);
  if (typeof req.csrfToken === 'function') {
    res.locals.csrfToken = req.csrfToken();
  }
  return res.status(500).render('login', {
    pageTitle: 'Server error',
    flash: {
      type: 'error',
      message: 'We ran into a server issue. Please retry.'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
