const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory database for educational purposes
const db = {
  users: [
    { id: 1, email: 'demo@bluemind.net', password_hash: '', created_at: new Date() },
    { id: 2, email: 'student@bluemind.net', password_hash: '', created_at: new Date() },
    { id: 3, email: 'teacher@bluemind.net', password_hash: '', created_at: new Date() }
  ],
  messages: [
    { id: 1, sender_id: 1, recipient_id: 2, subject: 'Welcome to BlueMind!', content: 'Welcome to our secure messaging system. This is a demo message.', created_at: new Date(), is_read: false },
    { id: 2, sender_id: 2, recipient_id: 1, subject: 'Security Best Practices', content: 'Remember to always use strong passwords and enable two-factor authentication.', created_at: new Date(), is_read: false },
    { id: 3, sender_id: 3, recipient_id: 1, subject: 'Course Assignment', content: 'Please review the web security concepts covered in today\'s lesson.', created_at: new Date(), is_read: false }
  ],
  nextUserId: 4,
  nextMessageId: 4
};

// Hash demo passwords
const demoPasswords = ['SecurePass123!', 'StudentPass456!', 'TeacherPass789!'];
demoPasswords.forEach((password, index) => {
  db.users[index].password_hash = bcrypt.hashSync(password, 12);
});

// Simple CSRF protection middleware
const csrfProtection = (req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  
  if (req.method === 'POST') {
    const token = req.body._csrf || req.headers['x-csrf-token'];
    if (!token || token !== req.session.csrfToken) {
      req.flash('error', 'Invalid security token. Please try again.');
      return res.redirect('/');
    }
  }
  
  res.locals.csrfToken = req.session.csrfToken;
  next();
};

// Security middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Session configuration
app.use(session({
  secret: 'your-super-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Flash messages
app.use(flash());

// Serve static files
app.use(express.static('public'));

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Helper functions for database operations
const findUserByEmail = (email) => {
  return db.users.find(user => user.email === email);
};

const findUserById = (id) => {
  return db.users.find(user => user.id === id);
};

const getUserMessages = (userId) => {
  return db.messages
    .filter(msg => msg.recipient_id === userId || msg.sender_id === userId)
    .map(msg => {
      const sender = findUserById(msg.sender_id);
      const recipient = findUserById(msg.recipient_id);
      return {
        ...msg,
        sender_email: sender ? sender.email : 'Unknown',
        recipient_email: recipient ? recipient.email : 'Unknown'
      };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/');
};

// Home route (login page)
app.get('/', csrfProtection, (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('login', { 
    csrfToken: res.locals.csrfToken,
    error: req.flash('error'),
    success: req.flash('success')
  });
});

// Login validation
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
];

// Login route
app.post('/login', loginLimiter, csrfProtection, loginValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', 'Invalid email or password format');
    return res.redirect('/');
  }

  const { email, password, computerType } = req.body;
  
  const user = findUserByEmail(email);

  if (!user) {
    req.flash('error', 'Invalid email or password');
    return res.redirect('/');
  }

  const isValidPassword = bcrypt.compareSync(password, user.password_hash);
  
  if (!isValidPassword) {
    req.flash('error', 'Invalid email or password');
    return res.redirect('/');
  }

  // Set session
  req.session.userId = user.id;
  req.session.userEmail = user.email;
  
  // Set session expiry based on computer type
  if (computerType === 'public') {
    req.session.cookie.maxAge = 30 * 60 * 1000; // 30 minutes for public computers
  } else {
    req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours for private computers
  }

  req.flash('success', 'Login successful!');
  res.redirect('/dashboard');
});

// Dashboard route
app.get('/dashboard', requireAuth, csrfProtection, (req, res) => {
  const messages = getUserMessages(req.session.userId);

  res.render('dashboard', {
    userEmail: req.session.userEmail,
    messages: messages,
    csrfToken: res.locals.csrfToken,
    success: req.flash('success'),
    error: req.flash('error'),
    sessionUserId: req.session.userId
  });
});

// Send message route
app.post('/send-message', requireAuth, csrfProtection, [
  body('recipient').isEmail().normalizeEmail(),
  body('subject').isLength({ min: 1, max: 200 }).trim().escape(),
  body('content').isLength({ min: 1, max: 5000 }).trim().escape()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', 'Please fill all fields correctly');
    return res.redirect('/dashboard');
  }

  const { recipient, subject, content } = req.body;

  // Find recipient user
  const recipientUser = findUserByEmail(recipient);
  
  if (!recipientUser) {
    req.flash('error', 'Recipient not found');
    return res.redirect('/dashboard');
  }

  // Insert message
  try {
    const newMessage = {
      id: db.nextMessageId++,
      sender_id: req.session.userId,
      recipient_id: recipientUser.id,
      subject: subject,
      content: content,
      created_at: new Date(),
      is_read: false
    };
    
    db.messages.push(newMessage);
    req.flash('success', 'Message sent successfully!');
  } catch (error) {
    req.flash('error', 'Error sending message');
  }
  
  res.redirect('/dashboard');
});

// Mark message as read
app.post('/mark-read/:id', requireAuth, csrfProtection, (req, res) => {
  const messageId = parseInt(req.params.id);
  
  try {
    const message = db.messages.find(msg => msg.id === messageId && msg.recipient_id === req.session.userId);
    if (message) {
      message.is_read = true;
    }
  } catch (error) {
    req.flash('error', 'Error updating message status');
  }
  
  res.redirect('/dashboard');
});

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/dashboard');
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

// Security headers endpoint (for educational purposes)
app.get('/security-info', (req, res) => {
  res.json({
    'Security Features Implemented': {
      'Password Hashing': 'bcrypt with salt rounds of 12',
      'Session Management': 'Express sessions with secure cookies',
      'CSRF Protection': 'Custom CSRF tokens on forms',
      'Rate Limiting': 'Login attempts limited to 5 per 15 minutes',
      'Input Validation': 'Server-side validation and sanitization',
      'XSS Prevention': 'Input escaping and Content Security Policy',
      'Security Headers': 'Helmet.js middleware',
      'Database': 'In-memory database for educational demo'
    },
    'Demo Users': [
      { email: 'demo@bluemind.net', password: 'SecurePass123!' },
      { email: 'student@bluemind.net', password: 'StudentPass456!' },
      { email: 'teacher@bluemind.net', password: 'TeacherPass789!' }
    ]
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  req.flash('error', 'Something went wrong. Please try again.');
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`BlueMind Security Demo running on port ${PORT}`);
  console.log('Demo accounts:');
  console.log('- demo@bluemind.net / SecurePass123!');
  console.log('- student@bluemind.net / StudentPass456!');
  console.log('- teacher@bluemind.net / TeacherPass789!');
});

module.exports = app;