const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const bcrypt = require('bcrypt');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
    },
  },
}));

// Body parsing middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.db',
    table: 'sessions'
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Database setup
const db = new sqlite3.Database('./database.db');

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Messages table
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (recipient_id) REFERENCES users(id)
  )`);
});

// Authentication middleware
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// Routes
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('login', { error: null });
});

app.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('login', { error: 'Invalid email or password' });
  }

  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      console.error(err);
      return res.render('login', { error: 'An error occurred' });
    }

    if (!user) {
      // Don't reveal whether email exists
      return res.render('login', { error: 'Invalid email or password' });
    }

    try {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.render('login', { error: 'Invalid email or password' });
      }

      // Set session
      req.session.userId = user.id;
      req.session.userEmail = user.email;
      res.redirect('/dashboard');
    } catch (err) {
      console.error(err);
      res.render('login', { error: 'An error occurred' });
    }
  });
});

app.get('/register', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('register', { error: null });
});

app.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('register', { error: errors.array()[0].msg });
  }

  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run('INSERT INTO users (email, password) VALUES (?, ?)', 
      [email, hashedPassword], 
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.render('register', { error: 'Email already registered' });
          }
          return res.render('register', { error: 'An error occurred' });
        }
        
        // Auto-login after registration
        req.session.userId = this.lastID;
        req.session.userEmail = email;
        res.redirect('/dashboard');
      }
    );
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'An error occurred' });
  }
});

app.get('/dashboard', requireAuth, (req, res) => {
  // Get messages for the current user
  db.all(`
    SELECT m.*, u.email as sender_email 
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.recipient_id = ?
    ORDER BY m.sent_at DESC
  `, [req.session.userId], (err, messages) => {
    if (err) {
      console.error(err);
      messages = [];
    }
    res.render('dashboard', { 
      userEmail: req.session.userEmail,
      messages: messages || []
    });
  });
});

app.get('/compose', requireAuth, (req, res) => {
  db.all('SELECT id, email FROM users WHERE id != ?', [req.session.userId], (err, users) => {
    res.render('compose', { 
      userEmail: req.session.userEmail,
      users: users || [],
      error: null,
      success: null
    });
  });
});

app.post('/compose', requireAuth, [
  body('recipient').isInt(),
  body('subject').notEmpty().trim().escape(),
  body('body').notEmpty().trim().escape()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return db.all('SELECT id, email FROM users WHERE id != ?', [req.session.userId], (err, users) => {
      res.render('compose', { 
        userEmail: req.session.userEmail,
        users: users || [],
        error: 'Please fill in all fields correctly',
        success: null
      });
    });
  }

  const { recipient, subject, body } = req.body;
  
  db.run('INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?)',
    [req.session.userId, recipient, subject, body],
    function(err) {
      if (err) {
        console.error(err);
        return db.all('SELECT id, email FROM users WHERE id != ?', [req.session.userId], (err, users) => {
          res.render('compose', { 
            userEmail: req.session.userEmail,
            users: users || [],
            error: 'Failed to send message',
            success: null
          });
        });
      }
      
      db.all('SELECT id, email FROM users WHERE id != ?', [req.session.userId], (err, users) => {
        res.render('compose', { 
          userEmail: req.session.userEmail,
          users: users || [],
          error: null,
          success: 'Message sent successfully!'
        });
      });
    }
  );
});

app.get('/message/:id', requireAuth, (req, res) => {
  const messageId = req.params.id;
  
  db.get(`
    SELECT m.*, u.email as sender_email 
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.id = ? AND m.recipient_id = ?
  `, [messageId, req.session.userId], (err, message) => {
    if (err || !message) {
      return res.redirect('/dashboard');
    }
    
    // Mark as read
    if (!message.read_at) {
      db.run('UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE id = ?', [messageId]);
    }
    
    res.render('message', { 
      userEmail: req.session.userEmail,
      message: message
    });
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    res.redirect('/login');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});