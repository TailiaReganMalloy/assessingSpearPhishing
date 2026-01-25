require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const helmet = require('helmet');
const csrf = require('csurf');
const bcrypt = require('bcryptjs');

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  console.warn('SESSION_SECRET is not set. Falling back to a development-only secret.');
}

app.use(
  session({
    store: new SQLiteStore({
      db: 'sessions.db',
      dir: path.join(__dirname, 'data'),
      concurrentDB: true
    }),
    name: 'secure-messaging.sid',
    secret: sessionSecret || 'change-this-secret-for-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 1000 * 60 * 60 // 1 hour
    }
  })
);

app.use(csrf());

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.currentUser = req.session.userId;
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    req.session.flash = { type: 'error', message: 'Please sign in to continue.' };
    res.redirect('/login');
    return;
  }
  next();
}

app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/inbox');
    return;
  }
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  if (req.session.userId) {
    res.redirect('/inbox');
    return;
  }
  res.render('login', { error: null });
});

app.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).render('login', { error: 'Email and password are required.' });
      return;
    }

    const user = await db.getUserByEmail(email);
    if (!user) {
      res.status(401).render('login', { error: 'Invalid credentials.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).render('login', { error: 'Invalid credentials.' });
      return;
    }

    req.session.regenerate((err) => {
      if (err) {
        next(err);
        return;
      }
      req.session.userId = user.id;
      req.session.displayName = user.display_name;
      res.redirect('/inbox');
    });
  } catch (error) {
    next(error);
  }
});

app.post('/logout', requireAuth, (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      next(err);
      return;
    }
    res.clearCookie('secure-messaging.sid');
    res.redirect('/login');
  });
});

app.get('/inbox', requireAuth, async (req, res, next) => {
  try {
    const user = await db.getUserById(req.session.userId);
    const messages = await db.getInboxForUser(user.id);
    res.render('inbox', { user, messages });
  } catch (error) {
    next(error);
  }
});

app.get('/compose', requireAuth, async (req, res) => {
  const user = await db.getUserById(req.session.userId);
  res.render('compose', { user, error: null });
});

app.post('/messages', requireAuth, async (req, res, next) => {
  const { recipientEmail, subject, body } = req.body;
  if (!recipientEmail || !subject || !body) {
    res.status(400).render('compose', { user: { display_name: req.session.displayName }, error: 'All fields are required.' });
    return;
  }

  try {
    await db.createMessage(req.session.userId, recipientEmail, subject.trim(), body.trim());
    req.session.flash = { type: 'success', message: 'Message sent securely.' };
    res.redirect('/inbox');
  } catch (error) {
    res.status(400).render('compose', { user: { display_name: req.session.displayName }, error: 'Could not deliver message. Check the recipient email.' });
  }
});

app.use((err, req, res, _next) => {
  console.error(err);
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).render('error', { message: 'Security validation failed. Please try submitting the form again.' });
    return;
  }
  res.status(500).render('error', { message: 'Unexpected error. Please try again later.' });
});

async function start() {
  try {
    await db.bootstrap();
    app.listen(PORT, () => {
      console.log(`Secure messaging sample running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start application', error);
    process.exit(1);
  }
}

start();
