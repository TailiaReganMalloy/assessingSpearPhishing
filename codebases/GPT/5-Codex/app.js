import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import express from 'express';
import session from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3';
import helmet from 'helmet';
import bcrypt from 'bcrypt';

import {
  initializeDatabase,
  findUserByEmail,
  findUserById,
  listMessagesForRecipient
} from './lib/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const SQLiteStore = SQLiteStoreFactory(session);
const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet({ contentSecurityPolicy: false }));

const sessionSecret = process.env.SESSION_SECRET || 'demo-development-secret';

app.use(
  session({
    store: new SQLiteStore({
      db: 'sessions.db',
      dir: dataDir,
      concurrentDB: true
    }),
    name: 'secure-demo.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 // 1 hour
    }
  })
);

app.use(async (req, res, next) => {
  if (!req.session.userId) {
    next();
    return;
  }

  try {
    const user = await findUserById(req.session.userId);
    if (user) {
      req.currentUser = user;
      res.locals.currentUser = user;
    }
  } catch (error) {
    console.error('Failed to load user from session', error);
  }

  next();
});

function ensureAuthenticated(req, res, next) {
  if (!req.currentUser) {
    res.redirect('/');
    return;
  }
  next();
}

app.get('/', (req, res) => {
  if (req.currentUser) {
    res.redirect('/inbox');
    return;
  }
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(422).render('login', { error: 'Please provide both email and password.' });
    return;
  }

  try {
    const user = await findUserByEmail(email.trim().toLowerCase());

    if (!user) {
      res.status(401).render('login', { error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).render('login', { error: 'Invalid email or password.' });
      return;
    }

    req.session.regenerate((sessionError) => {
      if (sessionError) {
        console.error(sessionError);
        res.status(500).render('login', { error: 'Unexpected error. Please try again.' });
        return;
      }
      req.session.userId = user.id;
      res.redirect('/inbox');
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('login', { error: 'Unexpected error. Please try again.' });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('secure-demo.sid');
    res.redirect('/');
  });
});

app.get('/inbox', ensureAuthenticated, async (req, res) => {
  try {
    const messages = await listMessagesForRecipient(req.currentUser.id);
    res.render('inbox', { user: req.currentUser, messages });
  } catch (err) {
    console.error(err);
    res.status(500).send('Unable to load messages right now.');
  }
});

const port = process.env.PORT || 3000;

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Secure messaging demo running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database', error);
    process.exit(1);
  });
