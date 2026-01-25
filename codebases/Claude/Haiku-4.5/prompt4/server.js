require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const db = require('./db');
const { authenticateToken } = require('./middleware');

// Import routes
const authRoutes = require('./routes/auth');
const messagesRoutes = require('./routes/messages');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Routes
app.use('/auth', authRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/users', authenticateToken, usersRoutes);

// Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Serve dashboard (protected)
app.get('/dashboard', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║    🔐 Secure Messaging Application                    ║
║    Educational Demonstration                          ║
╠════════════════════════════════════════════════════════╣
║    Server running on http://localhost:${PORT}          ║
║                                                        ║
║    Features:                                           ║
║    ✓ Secure password hashing (bcryptjs)              ║
║    ✓ JWT authentication                               ║
║    ✓ User registration & login                        ║
║    ✓ Inter-user messaging system                      ║
║    ✓ Session management                               ║
║                                                        ║
║    Test Credentials:                                   ║
║    Email: user1@example.com                           ║
║    Password: password123                              ║
║                                                        ║
║    Or register a new account                          ║
╚════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
