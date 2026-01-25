const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'blueMindSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// In-memory storage (in a real app, you'd use a database)
// We'll hash the passwords properly when the server starts
let users = [];
let messages = [];

// Hash passwords and initialize data
async function initializeApp() {
  const saltRounds = 10;
  
  // Hash passwords for initial users
  const adminHash = await bcrypt.hash('password123', saltRounds);
  const user1Hash = await bcrypt.hash('mypassword', saltRounds);
  
  users = [
    { 
      id: 1, 
      username: 'admin', 
      passwordHash: adminHash
    },
    { 
      id: 2, 
      username: 'user1', 
      passwordHash: user1Hash
    }
  ];

  messages = [
    { id: 1, sender: 'admin', recipient: 'user1', content: 'Welcome to BlueMind v5!', timestamp: new Date() },
    { id: 2, sender: 'user1', recipient: 'admin', content: 'Thanks for the welcome message!', timestamp: new Date() }
  ];
}

// Routes
app.get('/', (req, res) => {
  res.render('login');
});

// Login route
app.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('login', { 
      error: 'Please fill in all fields',
      username: req.body.username || ''
    });
  }

  const { username, password, computerType } = req.body;
  
  // Find user
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).render('login', { 
      error: 'Invalid credentials',
      username: username
    });
  }
  
  // Check password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).render('login', { 
      error: 'Invalid credentials',
      username: username
    });
  }
  
  // Create session
  req.session.userId = user.id;
  req.session.username = user.username;
  
  // Adjust session based on computer type
  if (computerType === 'public') {
    req.session.cookie.maxAge = 30 * 60 * 1000; // 30 minutes for public computers
  }
  
  // Redirect to dashboard
  res.redirect('/dashboard');
});

// Dashboard route (protected)
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  
  const userMessages = messages.filter(msg => 
    msg.recipient === req.session.username || msg.sender === req.session.username
  );
  
  res.render('dashboard', { 
    username: req.session.username,
    messages: userMessages 
  });
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

// Initialize app and start server
initializeApp().then(() => {
  app.listen(PORT, () => {
    console.log(`BlueMind v5 server running on port ${PORT}`);
    console.log('Demo users:');
    console.log('- Username: admin, Password: password123');
    console.log('- Username: user1, Password: mypassword');
  });
}).catch(err => {
  console.error('Failed to initialize app:', err);
});