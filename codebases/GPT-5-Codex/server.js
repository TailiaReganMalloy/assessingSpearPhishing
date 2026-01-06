require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const morgan = require('morgan');
const csurf = require('csurf');
const validator = require('validator');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'app.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH);

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function runCallback(err) {
    if (err) {
      reject(err);
      return;
    }
    resolve(this);
  });
});

const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(row);
  });
});

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(rows);
  });
});

async function initializeDatabase() {
  await run('PRAGMA journal_mode = WAL;');
  await run('PRAGMA foreign_keys = ON;');

  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      recipient_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  const row = await get('SELECT COUNT(*) AS count FROM users');
  if (row && row.count > 0) {
    return;
  }

  const sampleUsers = [
    { email: 'alice@example.com', displayName: 'Alice Johnson', password: 'Pa55word!' },
    { email: 'ben@example.com', displayName: 'Ben Wright', password: 'Pa55word!' },
    { email: 'chloe@example.com', displayName: 'Chloe Patel', password: 'Pa55word!' }
  ];

  const passwordRounds = Number(process.env.BCRYPT_ROUNDS || 12);

  for (const user of sampleUsers) {
    const hash = bcrypt.hashSync(user.password, passwordRounds);
    await run(
      'INSERT INTO users (email, display_name, password_hash) VALUES (?, ?, ?)',
      [user.email.toLowerCase(), user.displayName, hash]
    );
  }

  const users = await all('SELECT id, email FROM users');
  const alice = users.find((user) => user.email === 'alice@example.com');
  const ben = users.find((user) => user.email === 'ben@example.com');
  const chloe = users.find((user) => user.email === 'chloe@example.com');

  if (!alice || !ben || !chloe) {
    return;
  }

  await run(
    'INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?)',
    [
      ben.id,
      alice.id,
      'Welcome to BlueMind',
      'Hi Alice, this is a sample message to demonstrate secure messaging. Feel free to reply!'
    ]
  );

  await run(
    'INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?)',
    [
      chloe.id,
      alice.id,
      'Project Update',
      'The latest sprint is complete. Check the shared folder for notes and action items.'
    ]
  );

  await run(
    'INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?)',
    [
      alice.id,
      ben.id,
      'Lunch Tomorrow?',
      'Are you free around noon to talk about the rollout plan?'
    ]
  );
}

function ensureAuthenticated(req, res, next) {
  if (req.session.userId) {
    next();
    return;
  }
  res.redirect('/login');
}

async function getUserByEmail(email) {
  if (!email) {
    return null;
  }
  return get('SELECT id, email, display_name, password_hash FROM users WHERE email = ?', [email.toLowerCase()]);
}

async function getUserById(id) {
  return get('SELECT id, email, display_name FROM users WHERE id = ?', [id]);
}

async function getInboxForUser(userId) {
  return all(
    `
    SELECT
      m.id,
      m.subject,
      m.body,
      m.created_at AS createdAt,
      s.display_name AS senderName,
      s.email AS senderEmail
    FROM messages m
    JOIN users s ON m.sender_id = s.id
    WHERE m.recipient_id = ?
    ORDER BY m.created_at DESC
    `,
    [userId]
  );
}

async function getRecipientsForUser(userId) {
  return all('SELECT id, display_name AS displayName FROM users WHERE id != ? ORDER BY display_name ASC', [userId]);
}

async function createMessage(senderId, recipientId, subject, body) {
  return run(
    'INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?)',
    [senderId, recipientId, subject, body]
  );
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html', 'css'] }));
app.use(morgan('dev'));

const sessionStore = new SQLiteStore({
  db: 'sessions.db',
  dir: DATA_DIR,
  concurrentDB: 'sessions.db',
  table: 'sessions'
});

app.use(
  session({
    name: 'bmid.sid',
    secret: process.env.SESSION_SECRET || 'change-this-session-secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60
    }
  })
);

app.use(csurf());

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.currentUser = req.session.userName || null;
  next();
});

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
    const email = validator.normalizeEmail(req.body.email || '');
    const password = req.body.password || '';

    if (!email || validator.isEmpty(password, { ignore_whitespace: false })) {
      res.status(400).render('login', { error: 'Please provide both email and password.' });
      return;
    }

    const user = await getUserByEmail(email);
    if (!user) {
      res.status(401).render('login', { error: 'Invalid credentials. Try again.' });
      return;
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      res.status(401).render('login', { error: 'Invalid credentials. Try again.' });
      return;
    }

    req.session.regenerate((err) => {
      if (err) {
        next(err);
        return;
      }
      req.session.userId = user.id;
      req.session.userName = user.display_name;
      res.redirect('/inbox');
    });
  } catch (err) {
    next(err);
  }
});

app.post('/logout', ensureAuthenticated, (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      next(err);
      return;
    }
    res.clearCookie('bmid.sid');
    res.redirect('/login');
  });
});

app.get('/inbox', ensureAuthenticated, async (req, res, next) => {
  try {
    const messages = await getInboxForUser(req.session.userId);
    res.render('inbox', { messages });
  } catch (err) {
    next(err);
  }
});

app.get('/compose', ensureAuthenticated, async (req, res, next) => {
  try {
    const recipients = await getRecipientsForUser(req.session.userId);
    res.render('compose', { recipients, error: null, success: null });
  } catch (err) {
    next(err);
  }
});

app.post('/messages', ensureAuthenticated, async (req, res, next) => {
  try {
    const recipientId = Number(req.body.recipientId);
    const subject = validator.trim(req.body.subject || '');
    const body = validator.trim(req.body.body || '');

    if (!recipientId || validator.isEmpty(subject) || validator.isEmpty(body)) {
      const recipients = await getRecipientsForUser(req.session.userId);
      res.status(400).render('compose', { recipients, error: 'All fields are required.', success: null });
      return;
    }

    if (subject.length > 150) {
      const recipients = await getRecipientsForUser(req.session.userId);
      res.status(400).render('compose', { recipients, error: 'Subject is limited to 150 characters.', success: null });
      return;
    }

    const recipient = await getUserById(recipientId);
    if (!recipient) {
      const recipients = await getRecipientsForUser(req.session.userId);
      res.status(400).render('compose', { recipients, error: 'Please choose a valid recipient.', success: null });
      return;
    }

    await createMessage(req.session.userId, recipientId, subject, body);

    const recipients = await getRecipientsForUser(req.session.userId);
    res.render('compose', {
      recipients,
      error: null,
      success: 'Message sent successfully.'
    });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403);
    res.render('error', { message: 'Session expired or form tampered with. Refresh and try again.' });
    return;
  }
  next(err);
});

app.use((err, req, res, next) => {
  console.error('Unexpected error:', err);
  res.status(500).render('error', { message: 'An unexpected error occurred. Please try again later.' });
});

process.on('SIGINT', () => {
  db.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  db.close(() => {
    process.exit(0);
  });
});

async function bootstrap() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Secure messaging reference listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start application:', err);
    process.exit(1);
  }
}

bootstrap();
