const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Session configuration
app.use(session({
  secret: 'blueMindSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// In-memory storage (in a real app, this would be a database)
let users = [];
let messages = [];

// Helper function to hash passwords
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Helper function to verify passwords
async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Routes
// Home route - redirects to login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Login page
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Handle login
app.post('/login', async (req, res) => {
  const { login, password, computerType } = req.body;
  
  // Find user
  const user = users.find(u => u.login === login);
  
  if (!user) {
    return res.render('login', { error: 'Invalid login or password' });
  }
  
  // Verify password
  const isValidPassword = await verifyPassword(password, user.password);
  
  if (!isValidPassword) {
    return res.render('login', { error: 'Invalid login or password' });
  }
  
  // Store user in session
  req.session.user = {
    id: user.id,
    login: user.login,
    computerType: computerType
  };
  
  // Redirect to dashboard
  res.redirect('/dashboard');
});

// Registration page
app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Handle registration
app.post('/register', async (req, res) => {
  const { login, password } = req.body;
  
  // Check if user already exists
  if (users.some(u => u.login === login)) {
    return res.render('register', { error: 'User already exists' });
  }
  
  // Hash password
  const hashedPassword = await hashPassword(password);
  
  // Create new user
  const newUser = {
    id: users.length + 1,
    login: login,
    password: hashedPassword
  };
  
  users.push(newUser);
  
  // Redirect to login
  res.redirect('/login');
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  // Get messages for this user
  const userMessages = messages.filter(m => m.to === req.session.user.login);
  
  res.render('dashboard', { 
    user: req.session.user,
    messages: userMessages
  });
});

// Send message page
app.get('/send-message', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  res.render('send-message', { 
    user: req.session.user,
    error: null,
    success: null
  });
});

// Handle sending a message
app.post('/send-message', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  const { to, subject, content } = req.body;
  
  // Validate form
  if (!to || !subject || !content) {
    return res.render('send-message', { 
      user: req.session.user,
      error: 'All fields are required',
      success: null
    });
  }
  
  // Create message
  const newMessage = {
    id: messages.length + 1,
    from: req.session.user.login,
    to: to,
    subject: subject,
    content: content,
    timestamp: new Date()
  };
  
  messages.push(newMessage);
  
  res.render('send-message', { 
    user: req.session.user,
    error: null,
    success: 'Message sent successfully!'
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});