const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('database.db');

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id INTEGER,
      to_user_id INTEGER,
      message TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_user_id) REFERENCES users(id),
      FOREIGN KEY (to_user_id) REFERENCES users(id)
    )
  `);

  // Insert sample users
  const saltRounds = 10;
  const users = ['alice', 'bob', 'charlie'];
  users.forEach(username => {
    bcrypt.hash('password', saltRounds, (err, hash) => {
      if (err) throw err;
      db.run('INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)', [username, hash]);
    });
  });

  // Insert sample messages (assuming ids 1,2,3)
  db.run('INSERT OR IGNORE INTO messages (from_user_id, to_user_id, message) VALUES (1, 2, "Hello Bob!")');
  db.run('INSERT OR IGNORE INTO messages (from_user_id, to_user_id, message) VALUES (2, 3, "Hi Charlie, how are you?")');
  db.run('INSERT OR IGNORE INTO messages (from_user_id, to_user_id, message) VALUES (3, 1, "Hey Alice, nice to meet you!")');
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Middleware to check if logged in
function requireLogin(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/');
  }
}

app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/messages');
  } else {
    res.render('login');
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      res.render('login', { error: 'Database error' });
      return;
    }
    if (user && bcrypt.compareSync(password, user.password_hash)) {
      req.session.userId = user.id;
      req.session.username = user.username;
      res.redirect('/messages');
    } else {
      res.render('login', { error: 'Invalid credentials' });
    }
  });
});

app.get('/messages', requireLogin, (req, res) => {
  db.all(`
    SELECT m.message, u_from.username AS from_user, m.timestamp
    FROM messages m
    JOIN users u_from ON m.from_user_id = u_from.id
    WHERE m.to_user_id = ?
    ORDER BY m.timestamp DESC
  `, [req.session.userId], (err, messages) => {
    if (err) {
      res.send('Database error');
      return;
    }
    res.render('messages', { username: req.session.username, messages });
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});