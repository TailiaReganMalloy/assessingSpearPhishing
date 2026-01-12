const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true, // Prevents client-side JS from accessing the session cookie
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Serve login page
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/messages.html');
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// Serve messages page (protected)
app.get('/messages.html', (req, res) => {
  if (!req.session.userId) {
    res.redirect('/');
  } else {
    res.sendFile(path.join(__dirname, 'public', 'messages.html'));
  }
});

// Initialize database and start server
const PORT = process.env.PORT || 3000;

db.initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Educational Example: Secure Login & Messaging System');
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
