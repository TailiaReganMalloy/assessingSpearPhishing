const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./models/database');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const { requireLogin } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: 'your-secret-key-change-in-production', // SECURITY: Change this in production!
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS in production
    httpOnly: true, // Prevents JavaScript access to session cookie
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
db.initDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Serve main page
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('SECURITY REMINDER: This is an educational reference only.');
  console.log('For production use, implement proper SSL/TLS, input validation, and security measures.');
});
