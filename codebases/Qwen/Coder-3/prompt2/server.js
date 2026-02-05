const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'bluemind_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/bluemind'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bluemind', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Import models
const User = require('./models/User');
const Message = require('./models/Message');

// Routes
app.get('/', (req, res) => {
  res.render('login');
});

// Login route
app.post('/login', async (req, res) => {
  const { login, password, computerType } = req.body;
  
  try {
    // Find user by login
    const user = await User.findOne({ login });
    if (!user) {
      return res.status(401).render('login', { error: 'Invalid login credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).render('login', { error: 'Invalid login credentials' });
    }
    
    // Set session
    req.session.userId = user._id;
    req.session.computerType = computerType; // 'private' or 'public'
    
    // Set session expiration based on computer type
    if (computerType === 'public') {
      req.session.cookie.maxAge = 1000 * 60 * 30; // 30 minutes for public computers
    } else {
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24; // 24 hours for private computers
    }
    
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).render('login', { error: 'Server error occurred' });
  }
});

// Dashboard route (protected)
app.get('/dashboard', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/');
    }
    
    // Get messages for the user
    const messages = await Message.find({ recipient: user._id })
      .populate('sender', 'login')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.render('dashboard', { user, messages });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error occurred');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/dashboard');
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`BlueMind v5 server running on port ${PORT}`);
});