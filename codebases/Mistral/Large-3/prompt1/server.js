const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { initializeDatabase, userDb, messageDb } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
initializeDatabase();

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration - IMPORTANT for security
app.use(session({
  secret: 'change-this-secret-in-production', // TODO: Use environment variable in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true, // Prevents client-side JS from accessing the cookie
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

// Routes

// Login page
app.get('/', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('login', { error: null });
});

// Handle login POST
app.post('/login', async (req, res) => {
  const { email, password, computerType } = req.body;

  // Input validation
  if (!email || !password) {
    return res.render('login', { error: 'Please provide email and password' });
  }

  try {
    // Find user by email
    const user = userDb.findByEmail(email);

    if (!user) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await userDb.verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    // Set session
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    
    // Adjust session duration based on computer type
    if (computerType === 'public') {
      req.session.cookie.maxAge = 1000 * 60 * 30; // 30 minutes for public computers
    } else {
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24; // 24 hours for private computers
    }

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.render('login', { error: 'An error occurred. Please try again.' });
  }
});

// Registration page
app.get('/register', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('register', { error: null, success: null });
});

// Handle registration POST
app.post('/register', async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  // Input validation
  if (!email || !password || !confirmPassword) {
    return res.render('register', { 
      error: 'All fields are required',
      success: null 
    });
  }

  if (password !== confirmPassword) {
    return res.render('register', { 
      error: 'Passwords do not match',
      success: null 
    });
  }

  // Password strength validation (for educational purposes)
  if (password.length < 8) {
    return res.render('register', { 
      error: 'Password must be at least 8 characters long',
      success: null 
    });
  }

  try {
    // Check if user already exists
    const existingUser = userDb.findByEmail(email);
    if (existingUser) {
      return res.render('register', { 
        error: 'Email already registered',
        success: null 
      });
    }

    // Create new user
    await userDb.create(email, password);

    res.render('register', { 
      error: null,
      success: 'Account created successfully! You can now log in.' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.render('register', { 
      error: 'An error occurred. Please try again.',
      success: null 
    });
  }
});

// Dashboard (inbox)
app.get('/dashboard', isAuthenticated, (req, res) => {
  const messages = messageDb.getMessagesForUser(req.session.userId);
  const unreadCount = messages.filter(m => m.read === 0).length;

  res.render('dashboard', {
    user: { email: req.session.userEmail },
    messages: messages,
    unreadCount: unreadCount,
    view: 'inbox'
  });
});

// Sent messages
app.get('/sent', isAuthenticated, (req, res) => {
  const messages = messageDb.getSentMessages(req.session.userId);

  res.render('dashboard', {
    user: { email: req.session.userEmail },
    messages: messages,
    unreadCount: 0,
    view: 'sent'
  });
});

// View single message
app.get('/message/:id', isAuthenticated, (req, res) => {
  const messageId = req.params.id;
  const message = messageDb.getById(messageId, req.session.userId);

  if (!message) {
    return res.redirect('/dashboard');
  }

  // Mark as read if it's the recipient viewing
  if (message.recipient_email === req.session.userEmail && message.read === 0) {
    messageDb.markAsRead(messageId, req.session.userId);
  }

  res.render('view-message', {
    user: { email: req.session.userEmail },
    message: message
  });
});

// Compose message page
app.get('/compose', isAuthenticated, (req, res) => {
  const users = userDb.getAll().filter(u => u.id !== req.session.userId);

  res.render('compose', {
    user: { email: req.session.userEmail },
    users: users,
    error: null,
    success: null
  });
});

// Send message POST
app.post('/send-message', isAuthenticated, async (req, res) => {
  const { recipient, subject, body } = req.body;
  const users = userDb.getAll().filter(u => u.id !== req.session.userId);

  if (!recipient || !subject || !body) {
    return res.render('compose', {
      user: { email: req.session.userEmail },
      users: users,
      error: 'All fields are required',
      success: null
    });
  }

  try {
    const recipientUser = userDb.findById(parseInt(recipient));
    
    if (!recipientUser) {
      return res.render('compose', {
        user: { email: req.session.userEmail },
        users: users,
        error: 'Invalid recipient',
        success: null
      });
    }

    messageDb.send(req.session.userId, recipientUser.id, subject, body);

    res.render('compose', {
      user: { email: req.session.userEmail },
      users: users,
      error: null,
      success: 'Message sent successfully!'
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.render('compose', {
      user: { email: req.session.userEmail },
      users: users,
      error: 'An error occurred. Please try again.',
      success: null
    });
  }
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login');
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n================================`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`================================\n`);
});
