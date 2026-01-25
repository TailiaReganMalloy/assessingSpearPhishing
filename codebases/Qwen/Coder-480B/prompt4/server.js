const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const helmet = require('helmet');
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_key_for_demo_purposes_only',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 30 // 30 minutes
  }
}));

// CSRF protection
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// In-memory storage (in a real app, you'd use a database)
const users = {};
const messages = {};

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.get('/', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('login', { csrfToken: req.csrfToken() });
});

app.post('/login', authLimiter, async (req, res) => {
  const { login, password, computerType } = req.body;
  
  // Basic validation
  if (!login || !password) {
    return res.status(400).render('login', {
      error: 'Please provide both login and password',
      csrfToken: req.csrfToken()
    });
  }
  
  // Check if user exists
  const user = users[login];
  if (!user) {
    return res.status(401).render('login', {
      error: 'Invalid login credentials',
      csrfToken: req.csrfToken()
    });
  }
  
  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
  if (!isValidPassword) {
    return res.status(401).render('login', {
      error: 'Invalid login credentials',
      csrfToken: req.csrfToken()
    });
  }
  
  // Set session
  req.session.userId = login;
  req.session.computerType = computerType;
  
  // Adjust session expiration based on computer type
  if (computerType === 'public') {
    req.session.cookie.maxAge = 1000 * 60 * 5; // 5 minutes for public computers
  } else {
    req.session.cookie.maxAge = 1000 * 60 * 60; // 1 hour for private computers
  }
  
  res.redirect('/dashboard');
});

app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  
  const userMessages = messages[req.session.userId] || [];
  
  res.render('dashboard', {
    user: req.session.userId,
    messages: userMessages,
    computerType: req.session.computerType
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Route to send a message (for demo purposes)
app.post('/send-message', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { recipient, content } = req.body;
  
  if (!recipient || !content) {
    return res.status(400).json({ error: 'Recipient and content are required' });
  }
  
  // Create message
  const message = {
    id: Date.now(),
    sender: req.session.userId,
    content: content,
    timestamp: new Date().toISOString()
  };
  
  // Store message
  if (!messages[recipient]) {
    messages[recipient] = [];
  }
  messages[recipient].push(message);
  
  res.json({ success: true });
});

// Registration route (for demo purposes)
app.get('/register', (req, res) => {
  res.render('register', { csrfToken: req.csrfToken() });
});

app.post('/register', authLimiter, async (req, res) => {
  const { login, password } = req.body;
  
  // Basic validation
  if (!login || !password) {
    return res.status(400).render('register', {
      error: 'Please provide both login and password',
      csrfToken: req.csrfToken()
    });
  }
  
  // Check if user already exists
  if (users[login]) {
    return res.status(409).render('register', {
      error: 'User already exists',
      csrfToken: req.csrfToken()
    });
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);
  
  // Store user
  users[login] = {
    login: login,
    hashedPassword: hashedPassword
  };
  
  res.render('registration-success', { login: login });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Create a demo user for testing
  bcrypt.hash('password123', 12).then(hashedPassword => {
    users['demo'] = {
      login: 'demo',
      hashedPassword: hashedPassword
    };
    messages['demo'] = [
      {
        id: 1,
        sender: 'admin',
        content: 'Welcome to BlueMind v5! This is a sample message.',
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        sender: 'instructor',
        content: 'Remember to implement proper security measures in your assignments!',
        timestamp: new Date().toISOString()
      }
    ];
    console.log('Demo user created with login: demo and password: password123');
  });
});