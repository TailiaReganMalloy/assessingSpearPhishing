require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const bcrypt = require('bcrypt');
const csrf = require('csurf');
const helmet = require('helmet');
const morgan = require('morgan');

const {
  listUsers,
  findUserByEmail,
  listMessagesForUser,
  addMessage
} = require('./dataStore');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const cspDefaults = helmet.contentSecurityPolicy.getDefaultDirectives();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.locals.formatDate = (isoDate) => {
  return new Date(isoDate).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan('dev'));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...cspDefaults,
        "img-src": ["'self'", 'data:'],
        "style-src": ["'self'"],
        "script-src": ["'self'"]
      }
    }
  })
);

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'change-this-session-secret',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({ checkPeriod: 86400000 }),
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction
  }
};

app.use(session(sessionConfig));
app.use(csrf());

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.currentUser = req.session.user;
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.session.flash = { type: 'danger', message: 'Please sign in to continue.' };
    return res.redirect('/');
  }
  return next();
}

app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/messages');
  }
  return res.render('login', {
    deviceType: req.session.deviceType || 'private'
  });
});

app.post('/login', async (req, res, next) => {
  try {
    const { email, password, deviceType } = req.body;
    if (!email || !password) {
      req.session.flash = { type: 'danger', message: 'Email and password are required.' };
      return res.redirect('/');
    }

    const user = await findUserByEmail(email);
    if (!user) {
      req.session.flash = { type: 'danger', message: 'Invalid email or password.' };
      return res.redirect('/');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      req.session.flash = { type: 'danger', message: 'Invalid email or password.' };
      return res.redirect('/');
    }

    return req.session.regenerate((err) => {
      if (err) {
        return next(err);
      }
      req.session.user = {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role
      };

      req.session.deviceType = deviceType || 'private';
      req.session.cookie.maxAge = deviceType === 'private' ? 1000 * 60 * 60 * 4 : 1000 * 60 * 30;

      return res.redirect('/messages');
    });
  } catch (error) {
    return next(error);
  }
});

app.post('/logout', requireAuth, (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    res.clearCookie('connect.sid');
    return res.redirect('/');
  });
});

app.get('/messages', requireAuth, async (req, res, next) => {
  try {
    const [messages, users] = await Promise.all([
      listMessagesForUser(req.session.user.id),
      listUsers()
    ]);

    const userMap = new Map(users.map((user) => [user.id, user]));
    const decoratedMessages = messages.map((message) => ({
      ...message,
      senderName: userMap.get(message.senderId)?.displayName || 'Unknown sender'
    }));

    const recipients = users.filter((user) => user.id !== req.session.user.id);

    return res.render('messages', {
      messages: decoratedMessages,
      recipients
    });
  } catch (error) {
    return next(error);
  }
});

app.post('/messages', requireAuth, async (req, res, next) => {
  try {
    const { recipientId, subject, body } = req.body;
    if (!recipientId || !body || body.trim().length === 0) {
      req.session.flash = { type: 'danger', message: 'Choose a recipient and add content before sending.' };
      return res.redirect('/messages');
    }

    await addMessage({
      senderId: req.session.user.id,
      recipientId,
      subject: subject || '',
      body
    });

    req.session.flash = { type: 'success', message: 'Message delivered securely.' };
    return res.redirect('/messages');
  } catch (error) {
    return next(error);
  }
});

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    req.session.flash = { type: 'danger', message: 'Security token expired. Please retry.' };
    return res.redirect('back');
  }
  console.error(err);
  return res.status(500).render('login', {
    deviceType: req.session?.deviceType || 'private'
  });
});

module.exports = app;
