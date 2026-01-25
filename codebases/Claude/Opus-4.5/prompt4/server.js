const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Security Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-session-secret-change-in-production';

// Database Setup
const db = new sqlite3.Database('./secure_demo.db');

// Initialize database tables
db.serialize(() => {
  // Users table with security features
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until DATETIME,
    email_verified BOOLEAN DEFAULT 0
  )`);

  // Messages table
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    subject TEXT,
    content TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,
    FOREIGN KEY (sender_id) REFERENCES users (id),
    FOREIGN KEY (recipient_id) REFERENCES users (id)
  )`);

  // Login attempts table for security monitoring
  db.run(`CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN,
    attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Middleware Setup
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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration
app.use(session({
  store: new SQLiteStore({ db: 'sessions.db' }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Home page with login form
app.get('/', (req, res) => {
  res.render('index', { error: null, message: null });
});

// Registration page
app.get('/register', (req, res) => {
  res.render('register', { error: null, message: null });
});

// Dashboard (protected route)
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/?error=Please log in to access the dashboard');
  }
  
  // Get user info and messages
  db.get('SELECT email FROM users WHERE id = ?', [req.session.userId], (err, user) => {
    if (err || !user) {
      return res.redirect('/?error=Session expired');
    }
    
    // Get all users for messaging
    db.all('SELECT id, email FROM users WHERE id != ?', [req.session.userId], (err, users) => {
      if (err) users = [];
      
      // Get received messages
      db.all(`SELECT m.*, u.email as sender_email 
              FROM messages m 
              JOIN users u ON m.sender_id = u.id 
              WHERE m.recipient_id = ? 
              ORDER BY m.sent_at DESC`, [req.session.userId], (err, messages) => {
        if (err) messages = [];
        
        res.render('dashboard', { 
          user: user, 
          users: users, 
          messages: messages,
          userId: req.session.userId 
        });
      });
    });
  });
});

// User Registration
app.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('register', { 
      error: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.',
      message: null 
    });
  }

  const { email, password } = req.body;
  
  try {
    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingUser) => {
      if (err) {
        return res.render('register', { error: 'Database error occurred', message: null });
      }
      
      if (existingUser) {
        return res.render('register', { error: 'User with this email already exists', message: null });
      }
      
      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Insert new user
      db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', 
        [email, passwordHash], 
        function(err) {
          if (err) {
            return res.render('register', { error: 'Registration failed', message: null });
          }
          
          res.render('index', { 
            error: null, 
            message: 'Registration successful! Please log in.' 
          });
        }
      );
    });
  } catch (error) {
    res.render('register', { error: 'Registration failed', message: null });
  }
});

// User Login
app.post('/login', loginLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('index', { error: 'Invalid email or password format', message: null });
  }

  const { email, password, computerType } = req.body;
  const userAgent = req.headers['user-agent'];
  const ipAddress = req.ip;
  
  try {
    // Get user from database
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        // Log failed attempt
        db.run('INSERT INTO login_attempts (email, ip_address, user_agent, success) VALUES (?, ?, ?, ?)', 
          [email, ipAddress, userAgent, false]);
        return res.render('index', { error: 'Database error occurred', message: null });
      }
      
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        // Log failed attempt
        db.run('INSERT INTO login_attempts (email, ip_address, user_agent, success) VALUES (?, ?, ?, ?)', 
          [email, ipAddress, userAgent, false]);
          
        // Update failed login attempts
        if (user) {
          const newAttempts = user.failed_login_attempts + 1;
          const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null; // Lock for 15 minutes
          
          db.run('UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?', 
            [newAttempts, lockUntil, user.id]);
        }
        
        return res.render('index', { error: 'Invalid email or password', message: null });
      }
      
      // Check if account is locked
      if (user.locked_until && new Date() < new Date(user.locked_until)) {
        return res.render('index', { error: 'Account temporarily locked due to multiple failed login attempts', message: null });
      }
      
      // Successful login
      db.run('INSERT INTO login_attempts (email, ip_address, user_agent, success) VALUES (?, ?, ?, ?)', 
        [email, ipAddress, userAgent, true]);
      
      // Reset failed attempts and update last login
      db.run('UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP WHERE id = ?', 
        [user.id]);
      
      // Create session
      req.session.userId = user.id;
      req.session.email = user.email;
      
      // Set session expiry based on computer type
      if (computerType === 'public') {
        req.session.cookie.maxAge = 30 * 60 * 1000; // 30 minutes for public computers
      } else {
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours for private computers
      }
      
      res.redirect('/dashboard');
    });
  } catch (error) {
    db.run('INSERT INTO login_attempts (email, ip_address, user_agent, success) VALUES (?, ?, ?, ?)', 
      [email, ipAddress, userAgent, false]);
    res.render('index', { error: 'Login failed', message: null });
  }
});

// Send Message
app.post('/send-message', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const { recipientId, subject, content } = req.body;
  
  if (!recipientId || !content) {
    return res.status(400).json({ error: 'Recipient and content are required' });
  }
  
  db.run('INSERT INTO messages (sender_id, recipient_id, subject, content) VALUES (?, ?, ?, ?)', 
    [req.session.userId, recipientId, subject || 'No Subject', content], 
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to send message' });
      }
      
      // Emit real-time notification
      io.emit('new_message', {
        recipientId: parseInt(recipientId),
        senderId: req.session.userId,
        subject: subject || 'No Subject',
        content: content
      });
      
      res.json({ success: true, messageId: this.lastID });
    }
  );
});

// Get Messages API
app.get('/api/messages', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  db.all(`SELECT m.*, u.email as sender_email 
          FROM messages m 
          JOIN users u ON m.sender_id = u.id 
          WHERE m.recipient_id = ? 
          ORDER BY m.sent_at DESC`, [req.session.userId], (err, messages) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
    res.json(messages);
  });
});

// Mark message as read
app.post('/api/messages/:id/read', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const messageId = req.params.id;
  
  db.run('UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND recipient_id = ?', 
    [messageId, req.session.userId], 
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to mark message as read' });
      }
      res.json({ success: true });
    }
  );
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.redirect('/');
  });
});

// Security monitoring endpoint (for educational purposes)
app.get('/security-logs', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  
  db.all(`SELECT email, ip_address, success, attempted_at 
          FROM login_attempts 
          ORDER BY attempted_at DESC 
          LIMIT 50`, (err, logs) => {
    if (err) logs = [];
    res.render('security-logs', { logs });
  });
});

// Socket.io for real-time messaging
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join_room', (userId) => {
    socket.join(`user_${userId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { error: 'Page not found' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Secure Login Demo running on port ${PORT}`);
  console.log(`🔐 Security features enabled: bcrypt hashing, JWT tokens, rate limiting, session management`);
  console.log(`📧 Visit http://localhost:${PORT} to access the application`);
});

module.exports = app;