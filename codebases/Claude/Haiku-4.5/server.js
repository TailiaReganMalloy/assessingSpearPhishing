const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: 'your-secret-key-change-in-production', // IMPORTANT: Change this in production
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Initialize database
db.initializeDatabase();

// ==================== ROUTES ====================

// Home route - redirect to inbox if logged in, otherwise to login
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/inbox');
  } else {
    res.redirect('/login');
  }
});

// Login page
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Handle login
app.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('login', { error: 'Invalid email format' });
  }

  const { email, password } = req.body;

  db.getUserByEmail(email, (err, user) => {
    if (err) {
      return res.render('login', { error: 'Database error' });
    }

    if (!user) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    // Compare password with hashed password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.render('login', { error: 'Authentication error' });
      }

      if (!isMatch) {
        return res.render('login', { error: 'Invalid email or password' });
      }

      // Set session
      req.session.userId = user.id;
      req.session.userEmail = user.email;
      res.redirect('/inbox');
    });
  });
});

// Register page
app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Handle registration
app.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').notEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('register', { error: errors.array()[0].msg });
  }

  const { email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.render('register', { error: 'Passwords do not match' });
  }

  // Check if user already exists
  db.getUserByEmail(email, (err, user) => {
    if (err) {
      return res.render('register', { error: 'Database error' });
    }

    if (user) {
      return res.render('register', { error: 'Email already registered' });
    }

    // Hash password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.render('register', { error: 'Error creating account' });
      }

      // Create user
      db.createUser(email, hashedPassword, (err, userId) => {
        if (err) {
          return res.render('register', { error: 'Error creating account' });
        }

        req.session.userId = userId;
        req.session.userEmail = email;
        res.redirect('/inbox');
      });
    });
  });
});

// Inbox - view all messages
app.get('/inbox', isAuthenticated, (req, res) => {
  db.getMessagesByRecipient(req.session.userId, (err, messages) => {
    if (err) {
      return res.render('inbox', { email: req.session.userEmail, messages: [], error: 'Could not load messages' });
    }

    res.render('inbox', { 
      email: req.session.userEmail, 
      messages: messages || [],
      error: null 
    });
  });
});

// Compose page
app.get('/compose', isAuthenticated, (req, res) => {
  // Get all users to show as recipients
  db.getAllUsers((err, users) => {
    const otherUsers = users ? users.filter(u => u.id !== req.session.userId) : [];
    res.render('compose', { 
      email: req.session.userEmail, 
      recipients: otherUsers,
      error: null 
    });
  });
});

// Handle sending message
app.post('/send-message', isAuthenticated, [
  body('recipientId').notEmpty(),
  body('subject').notEmpty().trim(),
  body('message').notEmpty().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return db.getAllUsers((err, users) => {
      const otherUsers = users ? users.filter(u => u.id !== req.session.userId) : [];
      res.render('compose', { 
        email: req.session.userEmail, 
        recipients: otherUsers,
        error: 'Please fill in all fields' 
      });
    });
  }

  const { recipientId, subject, message } = req.body;

  // Verify recipient exists and is not the sender
  if (parseInt(recipientId) === req.session.userId) {
    return db.getAllUsers((err, users) => {
      const otherUsers = users ? users.filter(u => u.id !== req.session.userId) : [];
      res.render('compose', { 
        email: req.session.userEmail, 
        recipients: otherUsers,
        error: 'Cannot send message to yourself' 
      });
    });
  }

  db.sendMessage(req.session.userId, recipientId, subject, message, (err) => {
    if (err) {
      return db.getAllUsers((err, users) => {
        const otherUsers = users ? users.filter(u => u.id !== req.session.userId) : [];
        res.render('compose', { 
          email: req.session.userEmail, 
          recipients: otherUsers,
          error: 'Error sending message' 
        });
      });
    }

    res.redirect('/inbox');
  });
});

// View single message
app.get('/message/:id', isAuthenticated, (req, res) => {
  const messageId = req.params.id;

  db.getMessageById(messageId, (err, message) => {
    if (err || !message) {
      return res.render('message', { email: req.session.userEmail, message: null, error: 'Message not found' });
    }

    // Check if user is the recipient
    if (message.recipient_id !== req.session.userId) {
      return res.render('message', { email: req.session.userEmail, message: null, error: 'Unauthorized' });
    }

    // Mark as read
    db.markMessageAsRead(messageId, (err) => {
      res.render('message', { 
        email: req.session.userEmail, 
        message: message,
        error: null 
      });
    });
  });
});

// Delete message
app.post('/delete-message/:id', isAuthenticated, (req, res) => {
  const messageId = req.params.id;

  db.getMessageById(messageId, (err, message) => {
    if (err || !message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.recipient_id !== req.session.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    db.deleteMessage(messageId, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error deleting message' });
      }
      res.redirect('/inbox');
    });
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send('Error logging out');
    }
    res.redirect('/login');
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Visit http://localhost:${PORT}/login to get started`);
});
