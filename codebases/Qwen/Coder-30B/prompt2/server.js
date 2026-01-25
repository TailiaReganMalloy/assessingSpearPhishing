const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/bluemind'
  }),
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/views/login.html');
});

app.post('/login', async (req, res) => {
  const { login, password, computerType } = req.body;
  
  try {
    // In a real app, you would check against a database
    // For this example, we'll simulate a user lookup
    
    // Simulate user validation
    if (!login || !password) {
      return res.status(400).json({ error: 'Login and password are required' });
    }
    
    // Simulate password verification (in real app, you'd hash and compare)
    // This is a simplified example for educational purposes
    const isValidUser = login === 'student' && password === 'password123';
    
    if (isValidUser) {
      // Create JWT token
      const token = jwt.sign(
        { userId: login, computerType },
        process.env.JWT_SECRET || 'jwt-secret-key',
        { expiresIn: '24h' }
      );
      
      // Set session
      req.session.userId = login;
      req.session.computerType = computerType;
      
      res.json({ 
        success: true, 
        token,
        redirect: '/dashboard'
      });
    } else {
      res.status(401).json({ error: 'Invalid login or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.sendFile(__dirname + '/views/dashboard.html');
});

app.get('/messages', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.sendFile(__dirname + '/views/messages.html');
});

app.get('/api/messages', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Simulated messages data
  const messages = [
    {
      id: 1,
      from: 'professor',
      subject: 'Assignment Guidelines',
      content: 'Please review the updated assignment guidelines posted on the course portal.',
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      from: 'admin',
      subject: 'System Maintenance',
      content: 'Scheduled maintenance will occur this weekend. Expect brief downtime.',
      timestamp: new Date(Date.now() - 86400000).toISOString()
    }
  ];
  
  res.json(messages);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});