const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'change-this-secret-in-production',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

const db = new Database('db.sqlite');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_id INTEGER NOT NULL,
    to_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_id) REFERENCES users (id),
    FOREIGN KEY (to_id) REFERENCES users (id)
  )
`);

// Initialize demo users if table is empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  const hash1 = bcrypt.hashSync('admin', 10);
  const hash2 = bcrypt.hashSync('pass', 10);
  db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run('admin@email.com', hash1);
  db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run('user2@email.com', hash2);
  console.log('Demo users created: admin@email.com/admin, user2@email.com/pass');
}

app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { email, password, remember } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.render('login', { error: 'Invalid email or password' });
  }
  req.session.userId = user.id;
  req.session.email = user.email;
  if (remember === 'public') {
    req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  } else {
    req.session.cookie.maxAge = null; // Session cookie, expires on browser close
  }
  res.redirect('/dashboard');
});

app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

app.post('/register', (req, res) => {
  const { email, password, confirm } = req.body;
  if (password !== confirm) {
    return res.render('register', { error: 'Passwords do not match' });
  }
  if (!email || !password || password.length < 4) {
    return res.render('register', { error: 'Please provide valid email and password (min 4 chars)' });
  }
  try {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(email.toLowerCase().trim(), hash);
    res.redirect('/login');
  } catch (e) {
    res.render('register', { error: 'Email already exists' });
  }
});

app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  const messagesStmt = db.prepare(`
    SELECT m.id, m.message, m.created_at, u.email as from_email 
    FROM messages m 
    JOIN users u ON m.from_id = u.id 
    WHERE m.to_id = ? 
    ORDER BY m.created_at DESC 
    LIMIT 50
  `);
  const messages = messagesStmt.all(req.session.userId);
  res.render('dashboard', { messages, email: req.session.email, error: null });
});

app.post('/send', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  const { to_email, message } = req.body;
  if (!to_email || !message || message.trim().length === 0) {
    const messagesStmt = db.prepare(`
      SELECT m.id, m.message, m.created_at, u.email as from_email 
      FROM messages m JOIN users u ON m.from_id = u.id 
      WHERE m.to_id = ? ORDER BY m.created_at DESC LIMIT 50
    `);
    const messages = messagesStmt.all(req.session.userId);
    return res.render('dashboard', { messages, email: req.session.email, error: 'To email and message required' });
  }
  const toUser = db.prepare('SELECT id FROM users WHERE email = ?').get(to_email.trim().toLowerCase());
  if (!toUser) {
    const messagesStmt = db.prepare(`
      SELECT m.id, m.message, m.created_at, u.email as from_email 
      FROM messages m JOIN users u ON m.from_id = u.id 
      WHERE m.to_id = ? ORDER BY m.created_at DESC LIMIT 50
    `);
    const messages = messagesStmt.all(req.session.userId);
    return res.render('dashboard', { messages, email: req.session.email, error: 'Recipient not found' });
  }
  db.prepare('INSERT INTO messages (from_id, to_id, message) VALUES (?, ?, ?)').run(
    req.session.userId, 
    toUser.id, 
    message.trim()
  );
  res.redirect('/dashboard');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Demo accounts:');
  console.log('- admin@email.com / admin');
  console.log('- user2@email.com / pass');
});