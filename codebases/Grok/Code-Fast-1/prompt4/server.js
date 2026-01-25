const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');

const db = new Database('messages.db');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'secure-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false
}));

// Create tables
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password_hash TEXT
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_user TEXT,
  to_user TEXT,
  message TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// Insert demo users
const insertUser = db.prepare('INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)');
const hash = bcrypt.hashSync('password', 10);
insertUser.run('user1', hash);
insertUser.run('user2', hash);

// Routes
app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/messages');
  } else {
    res.render('login', { error: null });
  }
});

app.post('/login', async (req, res) => {
  const { login, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(login);
  if (user && await bcrypt.compare(password, user.password_hash)) {
    req.session.user = user.username;
    res.redirect('/messages');
  } else {
    res.render('login', { error: 'Invalid credentials' });
  }
});

app.get('/messages', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  const messages = db.prepare('SELECT * FROM messages WHERE to_user = ? ORDER BY timestamp DESC').all(req.session.user);
  res.render('messages', { user: req.session.user, messages });
});

app.post('/send', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  const { to, message } = req.body;
  db.prepare('INSERT INTO messages (from_user, to_user, message) VALUES (?, ?, ?)').run(req.session.user, to, message);
  res.redirect('/messages');
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`BlueMind v5 server running on port ${PORT}`));