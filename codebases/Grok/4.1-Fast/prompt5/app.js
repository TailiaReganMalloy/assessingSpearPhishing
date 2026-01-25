const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;
const saltRounds = 10; // For bcrypt hashing - security best practice: use high salt rounds

// Database setup - SQLite for simplicity in example
const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize tables securely
db.serialize(() => {
  // Users table with hashed passwords (never store plain text!)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);

  // Messages table - simple public board for demo
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session management - secure user authentication state
app.use(session({
  secret: 'change-this-to-a-long-random-string-in-production!!', // SECURITY: Use env var/crypto.randomBytes
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Authentication middleware - protects routes
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

// Routes

// Redirect root to login
app.get('/', (req, res) => res.redirect('/login'));

// Login page
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Register page
app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Register POST - secure password hashing
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || password.length < 8) {
    return res.render('register', { error: 'Email and password (min 8 chars) required' });
  }
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hash], function(err) {
      if (err) {
        return res.render('register', { error: 'Email already registered. <a href="/login">Login?</a>' });
      }
      req.session.userId = this.lastID;
      res.redirect('/dashboard');
    });
  } catch (err) {
    res.render('register', { error: 'Registration failed' });
  }
});

// Login POST - secure password comparison
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT id, password FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) {
      return res.render('login', { error: 'Invalid email or password' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.userId = user.id;
      res.redirect('/dashboard');
    } else {
      res.render('login', { error: 'Invalid email or password' });
    }
  });
});

// Dashboard - view messages (protected)
app.get('/dashboard', isAuthenticated, (req, res) => {
  db.all(`
    SELECT m.id, m.message, m.timestamp, u.email as sender 
    FROM messages m 
    JOIN users u ON m.user_id = u.id 
    ORDER BY m.timestamp DESC 
    LIMIT 50
  `, (err, messages) => {
    if (err) {
      return res.render('dashboard', { messages: [], error: 'Database error' });
    }
    res.render('dashboard', { messages });
  });
});

// Send message POST (protected) - prepared statement prevents SQL injection
app.post('/send-message', isAuthenticated, (req, res) => {
  const { message } = req.body;
  if (!message || message.trim().length === 0 || message.length > 500) {
    return res.redirect('/dashboard');
  }
  db.run('INSERT INTO messages (user_id, message) VALUES (?, ?)', 
    [req.session.userId, message.trim()], 
    (err) => {
      if (err) console.error(err);
      res.redirect('/dashboard');
    }
  );
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// 404
app.use((req, res) => res.status(404).send('Not found'));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('SECURITY NOTES FOR STUDENTS:');
  console.log('- Passwords are hashed with bcrypt (never store plain text)');
  console.log('- SQL prepared statements (? placeholders) prevent injection');
  console.log('- Sessions manage auth state securely');
  console.log('- In production: use HTTPS, strong session secret, rate limiting, input validation, CSRF tokens, etc.');
});
