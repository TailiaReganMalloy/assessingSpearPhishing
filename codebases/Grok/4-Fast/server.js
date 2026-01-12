const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'database.db'));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_id INTEGER NOT NULL,
    to_email TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_id) REFERENCES users (id)
  )`);
});

// Route for registration page
app.get('/register', (req, res) => {
  res.render('register');
});

// Handle registration
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], function(err) {
      if (err) {
        return res.render('register', { error: 'Email already exists or error occurred.' });
      }
      res.redirect('/login');
    });
  } catch (error) {
    res.render('register', { error: 'Registration failed.' });
  }
});

// Route for login page
app.get('/login', (req, res) => {
  res.render('login');
});

// Handle login
app.post('/login', (req, res) => {
  const { email, password, computer } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) {
      return res.render('login', { error: 'Invalid credentials.' });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.render('login', { error: 'Invalid credentials.' });
    }
    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.computer = computer || 'public';
    res.redirect('/dashboard');
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/dashboard');
    }
    res.redirect('/login');
  });
});

// Dashboard - view messages
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  db.all(`
    SELECT m.id, m.message, m.timestamp, u.email as from_email 
    FROM messages m 
    JOIN users u ON m.from_id = u.id 
    WHERE m.to_email = ? 
    ORDER BY m.timestamp DESC
  `, [req.session.email], (err, messages) => {
    if (err) {
      return res.render('dashboard', { messages: [], email: req.session.email, computer: req.session.computer, error: 'Error fetching messages.' });
    }
    res.render('dashboard', { messages, email: req.session.email, computer: req.session.computer });
  });
});

// Send message page
app.get('/send', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('send');
});

// Handle sending message
app.post('/send', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  const { to_email, message } = req.body;
  if (!to_email || !message) {
    return res.render('send', { error: 'To email and message are required.' });
  }
  db.run(
    'INSERT INTO messages (from_id, to_email, message) VALUES (?, ?, ?)',
    [req.session.userId, to_email, message],
    function(err) {
      if (err) {
        return res.render('send', { error: 'Error sending message.' });
      }
      res.redirect('/dashboard');
    }
  );
});

// Root redirect to login
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});