const express = require('express');
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'your-secret-key', // Change this to a secure random string
  resave: false,
  saveUninitialized: true
}));

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER,
    message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(receiver_id) REFERENCES users(id)
  )`);
});

// Routes

// Home route - redirect to login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Login page
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.render('login', { error: 'Database error' });
    }
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.render('login', { error: 'Invalid credentials' });
    }
    req.session.userId = user.id;
    res.redirect('/dashboard');
  });
});

// Register page
app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err) => {
    if (err) {
      return res.render('register', { error: 'Email already exists' });
    }
    res.redirect('/login');
  });
});

// Dashboard - view messages
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  db.all('SELECT m.*, u.email as sender FROM messages m JOIN users u ON m.sender_id = u.id WHERE receiver_id = ? ORDER BY timestamp DESC', [req.session.userId], (err, messages) => {
    if (err) {
      return res.render('dashboard', { messages: [], error: 'Database error' });
    }
    res.render('dashboard', { messages, userId: req.session.userId });
  });
});

// Send message
app.post('/send', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  const { receiverEmail, message } = req.body;
  db.get('SELECT id FROM users WHERE email = ?', [receiverEmail], (err, receiver) => {
    if (err || !receiver) {
      return res.redirect('/dashboard'); // Handle error appropriately
    }
    db.run('INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)', [req.session.userId, receiver.id, message], (err) => {
      res.redirect('/dashboard');
    });
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});