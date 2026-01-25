require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const csurf = require('csurf');

require('./db/database');

const authRoutes = require('./routes/authRoutes');
const pageRoutes = require('./routes/pageRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { attachUser } = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "img-src": ["'self'", 'data:'],
        "style-src": ["'self'", "'unsafe-inline'"],
      },
    },
  })
);
app.use(compression());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(morgan('dev'));

app.use(
  session({
    store: new SQLiteStore({
      dir: path.join(__dirname, '../data'),
      db: 'sessions.sqlite',
      concurrentDB: true,
    }),
    secret: process.env.SESSION_SECRET || 'change_this_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

app.use(attachUser);
app.use(csurf());

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.currentUser = req.user;
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  res.locals.appTitle = 'BlueMind Secure Mail';
  res.locals.year = new Date().getFullYear();
  next();
});

app.use('/', authRoutes);
app.use('/', pageRoutes);
app.use('/messages', messageRoutes);

app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
  });
});

app.use((err, req, res, _next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).render('error', {
      title: 'Security Check Failed',
      message: 'Your session token expired or is invalid. Please retry.',
    });
  }

  console.error(err);
  return res.status(500).render('error', {
    title: 'Server Error',
    message: 'An unexpected error occurred. Please try again later.',
  });
});

app.listen(port, () => {
  console.log(`BlueMind Secure Mail running at http://localhost:${port}`);
});
