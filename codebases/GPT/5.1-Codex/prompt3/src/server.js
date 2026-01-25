require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const dayjs = require('dayjs');

const { verifyUserCredentials } = require('./services/auth');
const { getMessagesForRecipient, getMessageForRecipient } = require('./services/dataStore');

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'insecure-development-secret';
const IN_PRODUCTION = process.env.NODE_ENV === 'production';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.locals.brand = {
  name: 'BlueMind',
  version: 'v5'
};

app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

// Session cookies are httpOnly and sameSite to reduce CSRF and XSS exposure.
app.use(
  session({
    name: 'bluemind.sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: IN_PRODUCTION,
      maxAge: 1000 * 60 * 60 // 1 hour
    }
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.cspNonce = res.locals.cspNonce || '';
  next();
});

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/');
  }
  return next();
}

app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/messages');
  }

  return res.render('login', {
    errors: [],
    lastEmail: ''
  });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !password) {
    errors.push('Email and password are required.');
    return res.status(400).render('login', { errors, lastEmail: email || '' });
  }

  try {
    const user = await verifyUserCredentials(email, password);

    if (!user) {
      errors.push('Invalid credentials. Please try again.');
      return res.status(401).render('login', { errors, lastEmail: email });
    }

    req.session.user = user;
    return req.session.save(() => res.redirect('/messages'));
  } catch (error) {
    // Avoid leaking sensitive error details to the UI.
    console.error('Login error:', error);
    errors.push('Unexpected error. Please try again.');
    return res.status(500).render('login', { errors, lastEmail: email });
  }
});

app.post('/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('bluemind.sid');
    res.redirect('/');
  });
});

app.get('/messages', requireAuth, (req, res) => {
  const rawMessages = getMessagesForRecipient(req.session.user.id);
  const messages = rawMessages.map((message) => ({
    ...message,
    friendlyDate: dayjs(message.sentAt).format('ddd, MMM D · h:mm A')
  }));

  return res.render('messages', { messages });
});

app.get('/messages/:messageId', requireAuth, (req, res, next) => {
  const message = getMessageForRecipient(req.session.user.id, req.params.messageId);

  if (!message) {
    return res.status(404).render('message-detail', {
      error: 'Message not found.',
      message: null
    });
  }

  const hydratedMessage = {
    ...message,
    friendlyDate: dayjs(message.sentAt).format('dddd, MMMM D, YYYY h:mm A')
  };

  return res.render('message-detail', { message: hydratedMessage, error: null });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).render('message-detail', {
    error: 'Something went wrong. Please try again later.',
    message: null
  });
});

app.listen(PORT, () => {
  console.log(`BlueMind reference app listening on http://localhost:${PORT}`);
});
