// Secure Messaging Demo for Web Dev Class
// Features: User registration/login with bcrypt hashing, session management, SQLite DB for users/messages
// UI inspired by mailer.gov.bf - simple login form, dashboard with inbox/send

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set true for HTTPS
}));

// Database setup
const db = new sqlite3.Database('messages.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_id INTEGER NOT NULL,
    to_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_id) REFERENCES users (id),
    FOREIGN KEY (to_id) REFERENCES users (id)
  )`);
  
  // Seed sample users (password: 'password123' hashed)
  const sampleUsers = [
    { username: 'student1', email: 'student1@class.edu', password: 'password123' },
    { username: 'student2', email: 'student2@class.edu', password: 'password123' },
    { username: 'professor', email: 'prof@class.edu', password: 'admin123' }
  ];
  
  sampleUsers.forEach(user => {
    bcrypt.hash(user.password, 10, (err, hash) => {
      if (err) return console.error(err);
      db.run('INSERT OR IGNORE INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [user.username, user.email, hash]);
    });
  });
});

// Middleware to check auth
function requireAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Routes
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).send('Error hashing password');
    db.run('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hash], function(err) {
        if (err) {
          return res.render('register', { error: 'Username or email already exists' });
        }
        res.redirect('/login');
      });
  });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) {
      return res.render('login', { error: 'Invalid credentials' });
    }
    bcrypt.compare(password, user.password_hash, (err, match) => {
      if (match) {
        req.session.userId = user.id;
        req.session.username = user.username;
        res.redirect('/dashboard');
      } else {
        res.render('login', { error: 'Invalid credentials' });
      }
    });
  });
});

app.get('/logout', requireAuth, (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/dashboard', requireAuth, (req, res) => {
  const userId = req.session.userId;
  
  // Get inbox messages
  db.all(`SELECT m.*, u.username as from_username 
          FROM messages m 
          JOIN users u ON m.from_id = u.id 
          WHERE m.to_id = ? 
          ORDER BY m.created_at DESC`, [userId], (err, inbox) => {
    if (err) return res.send('DB Error');
    
    // Get all users for send-to dropdown (exclude self)
    db.all('SELECT id, username FROM users WHERE id != ?', [userId], (err, users) => {
      if (err) return res.send('DB Error');
      res.render('dashboard', { 
        username: req.session.username,
        inbox,
        users 
      });
    });
  });
});

app.post('/send-message', requireAuth, (req, res) => {
  const { to_username, message } = req.body;
  const fromId = req.session.userId;
  
  db.get('SELECT id FROM users WHERE username = ?', [to_username], (err, toUser) => {
    if (err || !toUser) {
      return res.redirect('/dashboard');
    }
    db.run('INSERT INTO messages (from_id, to_id, message) VALUES (?, ?, ?)',
      [fromId, toUser.id, message], (err) => {
        if (err) console.error(err);
        res.redirect('/dashboard');
      });
  });
});

// 404
app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Sample users: student1/student2/professor (passwords: password123/admin123)');
});
