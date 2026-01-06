const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(session({
  secret: 'your-secret-key', // In production, use a strong, random secret
  resave: false,
  saveUninitialized: false
}));

// Database setup
// Using SQLite for simplicity in this educational example
// In production, consider using PostgreSQL, MySQL, or MongoDB
const db = new sqlite3.Database('./mailer.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    createTables();
  }
});

function createTables() {
  // Create users table
  // SECURITY NOTE: Passwords are stored as hashes, never in plain text
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);

  // Create messages table
  // SECURITY NOTE: Messages are stored with sender/receiver IDs to prevent unauthorized access
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users (id),
    FOREIGN KEY (receiver_id) REFERENCES users (id)
  )`);
}

// Middleware to check if user is authenticated
// SECURITY NOTE: This protects routes that require login
function requireAuth(req, res, next) {
  if (req.session.userId) {
    return next();
  } else {
    res.redirect('/login');
  }
}

// Routes
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.render('login', { error: 'Database error' });
    }
    if (!user) {
      return res.render('login', { error: 'Invalid username or password' });
    }

    // SECURITY NOTE: Compare the provided password with the stored hash
    // This ensures passwords are never stored or compared in plain text
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        req.session.userId = user.id;
        req.session.username = user.username;
        res.redirect('/inbox');
      } else {
        res.render('login', { error: 'Invalid username or password' });
      }
    });
  });
});

app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // SECURITY NOTE: Hash passwords before storing them
  // This prevents attackers from reading passwords if the database is compromised
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.render('register', { error: 'Error hashing password' });
    }

    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          res.render('register', { error: 'Username already exists' });
        } else {
          res.render('register', { error: 'Database error' });
        }
      } else {
        req.session.userId = this.lastID;
        req.session.username = username;
        res.redirect('/inbox');
      }
    });
  });
});

app.get('/inbox', requireAuth, (req, res) => {
  // SECURITY NOTE: Only show messages where the current user is the receiver
  // This prevents users from seeing messages not intended for them
  db.all(`SELECT messages.*, users.username as sender_username
          FROM messages
          JOIN users ON messages.sender_id = users.id
          WHERE receiver_id = ?
          ORDER BY timestamp DESC`, [req.session.userId], (err, messages) => {
    if (err) {
      return res.send('Database error');
    }
    res.render('inbox', { messages, username: req.session.username });
  });
});

app.get('/compose', requireAuth, (req, res) => {
  res.render('compose', { error: null });
});

app.post('/compose', requireAuth, (req, res) => {
  const { receiver, subject, body } = req.body;

  // SECURITY NOTE: Verify the receiver exists before sending
  // Also, store sender_id from session to ensure authenticity
  db.get('SELECT id FROM users WHERE username = ?', [receiver], (err, user) => {
    if (err || !user) {
      return res.render('compose', { error: 'User not found' });
    }

    db.run('INSERT INTO messages (sender_id, receiver_id, subject, body) VALUES (?, ?, ?, ?)',
           [req.session.userId, user.id, subject, body], (err) => {
      if (err) {
        res.render('compose', { error: 'Error sending message' });
      } else {
        res.redirect('/inbox');
      }
    });
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});