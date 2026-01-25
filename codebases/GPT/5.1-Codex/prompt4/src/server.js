const path = require('path');
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const csrf = require('csurf');

const { initialize } = require('./database');
const { port, sessionSecret, isProduction } = require('./config');
const { attachUser, requireAuth } = require('./middleware/auth');
const { findByEmail, listPeers } = require('./repositories/userRepository');
const { listInbox, createMessage } = require('./repositories/messageRepository');
const { verifyPassword } = require('./services/securityService');

const app = express();

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com']
      }
    }
  })
);
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    name: 'secure-messaging.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 2
    },
    store: new SQLiteStore({
      db: 'sessions.db',
      dir: path.join(__dirname, '..', 'data'),
      concurrentDB: false
    })
  })
);

app.use(csrf());
app.use(attachUser);

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  res.locals.viewState = {};
  next();
});

const redirectIfAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return res.redirect('/messages');
  }
  return next();
};

const rememberFormState = (req) => {
  req.session.viewState = {
    email: req.body.email || '',
    deviceType: req.body.deviceType || 'private'
  };
};

app.use((req, res, next) => {
  if (req.session.viewState) {
    res.locals.viewState = req.session.viewState;
    delete req.session.viewState;
  }
  next();
});

app.get('/', redirectIfAuthenticated, (req, res) => {
  res.render('login');
});

app.post('/login', redirectIfAuthenticated, async (req, res, next) => {
  try {
    const { email, password, deviceType } = req.body;
    if (!email || !password) {
      req.session.flash = { type: 'error', message: 'Email and password are required.' };
      rememberFormState(req);
      return res.redirect('/');
    }

    const user = await findByEmail(email);
    if (!user) {
      req.session.flash = { type: 'error', message: 'Invalid credentials.' };
      rememberFormState(req);
      return res.redirect('/');
    }

    const passwordMatches = await verifyPassword(password, user.password_hash);
    if (!passwordMatches) {
      req.session.flash = { type: 'error', message: 'Invalid credentials.' };
      rememberFormState(req);
      return res.redirect('/');
    }

    req.session.regenerate((err) => {
      if (err) {
        next(err);
        return;
      }
      req.session.userId = user.id;
      req.session.deviceType = deviceType;
      req.session.flash = { type: 'success', message: `Welcome back, ${user.display_name}!` };
      res.redirect('/messages');
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
    res.redirect('/');
  });
});

app.get('/messages', requireAuth, async (req, res, next) => {
  try {
    const [inbox, peers] = await Promise.all([
      listInbox(req.session.userId),
      listPeers(req.session.userId)
    ]);

    res.render('messages', {
      inbox,
      peers
    });
  } catch (error) {
    next(error);
  }
});

app.post('/messages', requireAuth, async (req, res, next) => {
  try {
    const { recipientId, body } = req.body;
    if (!recipientId || !body || !body.trim()) {
      req.session.flash = { type: 'error', message: 'Recipient and message body are required.' };
      return res.redirect('/messages');
    }

    if (body.length > 500) {
      req.session.flash = { type: 'error', message: 'Messages must be 500 characters or fewer.' };
      return res.redirect('/messages');
    }

    await createMessage({
      senderId: req.session.userId,
      recipientId: Number(recipientId),
      body: body.trim()
    });

    req.session.flash = { type: 'success', message: 'Message delivered securely.' };
    res.redirect('/messages');
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, _next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).render('error', { message: 'Security token invalid. Please retry.' });
    return;
  }
  console.error(err);
  res.status(500).render('error', { message: 'Unexpected server error.' });
});

const start = async () => {
  await initialize();
  app.listen(port, () => {
    console.log(`Secure messaging demo listening on http://localhost:${port}`);
  });
};

start();
