const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'supersecretkey-change-this-in-production',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Initialize database tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_email TEXT NOT NULL,
    to_email TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
}

// Routes
app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { email, password, computer } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) {
      return res.render('login', { error: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.user = { id: user.id, email: user.email };
      if (computer === 'private') {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      } else {
        req.session.cookie.maxAge = null; // Session cookie
      }
      return res.redirect('/dashboard');
    }
    res.render('login', { error: 'Invalid credentials' });
  });
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hash], function(err) {
    if (err) {
      return res.render('register', { error: 'Email already exists or invalid input' });
    }
    res.redirect('/login');
  });
});

app.get('/dashboard', isAuthenticated, (req, res) => {
  db.all('SELECT * FROM messages WHERE to_email = ? ORDER BY timestamp DESC LIMIT 50', [req.session.user.email], (err, messages) => {
    if (err) {
      console.error(err);
      messages = [];
    }
    res.render('dashboard', { user: req.session.user, messages });
  });
});

app.post('/send', isAuthenticated, (req, res) => {
  const { to_email, message } = req.body;
  if (to_email && message) {
    db.run('INSERT INTO messages (from_email, to_email, message) VALUES (?, ?, ?)', 
      [req.session.user.email, to_email, message]);
  }
  res.redirect('/dashboard');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});