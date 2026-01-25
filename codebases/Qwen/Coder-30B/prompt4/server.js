const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'blue-mind-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files
app.use(express.static('public'));

// Initialize database
const db = new sqlite3.Database(':memory:'); // Using in-memory DB for simplicity

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users (id),
    FOREIGN KEY (receiver_id) REFERENCES users (id)
  )`);
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

// Login route
app.post('/login', (req, res) => {
  const { login, password, computerType } = req.body;
  
  // Validate input
  if (!login || !password) {
    return res.status(400).json({ error: 'Login and password are required' });
  }

  // Find user in database
  db.get('SELECT id, username, password_hash FROM users WHERE username = ?', [login], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    bcrypt.compare(password, row.password_hash, (err, isMatch) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Authentication error' });
      }
      
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Store user in session
      req.session.userId = row.id;
      req.session.username = row.username;
      req.session.computerType = computerType;
      
      res.json({ success: true, redirect: '/dashboard' });
    });
  });
});

// Register route
app.post('/register', (req, res) => {
  const { login, password } = req.body;
  
  // Validate input
  if (!login || !password) {
    return res.status(400).json({ error: 'Login and password are required' });
  }
  
  // Hash password
  bcrypt.hash(password, 12, (err, hash) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Password hashing error' });
    }
    
    // Insert user into database
    db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [login, hash], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Username already exists' });
        }
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ success: true, message: 'User registered successfully' });
    });
  });
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  
  res.sendFile(__dirname + '/public/dashboard.html');
});

// Get messages route
app.get('/messages', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  db.all('SELECT m.*, u.username as sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE receiver_id = ? ORDER BY created_at DESC', [req.session.userId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(rows);
  });
});

// Send message route
app.post('/send-message', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { recipient, content } = req.body;
  
  if (!recipient || !content) {
    return res.status(400).json({ error: 'Recipient and content are required' });
  }
  
  // Find recipient
  db.get('SELECT id FROM users WHERE username = ?', [recipient], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.status(400).json({ error: 'Recipient not found' });
    }
    
    // Insert message
    db.run('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)', 
           [req.session.userId, row.id, content], function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ success: true, message: 'Message sent successfully' });
    });
  });
});

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ success: true });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`BlueMind server running on port ${PORT}`);
});

module.exports = app;