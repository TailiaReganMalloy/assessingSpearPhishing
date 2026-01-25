require('dotenv').config();
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const path = require('path');

const db = require('./db/database');
const { router: authRouter } = require('./routes/auth');
const messagesRouter = require('./routes/messages');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet());

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Session middleware with secure configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent JavaScript access to session cookie
    sameSite: 'strict', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// ============================================
// VIEW ENGINE SETUP
// ============================================

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============================================
// STATIC FILES
// ============================================

app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// ROUTES
// ============================================

// Authentication routes
app.use('/', authRouter);

// Messages routes (protected)
app.use('/messages', messagesRouter);

// ============================================
// ERROR HANDLING
// ============================================

app.use((req, res) => {
  res.status(404).render('404', { userName: req.session?.userName });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║  Secure Messaging Application - Educational Demo      ║
║  Server running at http://localhost:${PORT}                ║
║  Node.js Web Security Course Material                 ║
╚════════════════════════════════════════════════════════╝
  
Security Features Implemented:
  ✓ Bcrypt password hashing (10 salt rounds)
  ✓ Secure session management (httpOnly, sameSite)
  ✓ CSRF protection via sessions
  ✓ SQL injection prevention via parameterized queries
  ✓ Input validation with express-validator
  ✓ Helmet.js security headers
  ✓ Password strength requirements (min 8 chars)
  
Navigate to http://localhost:${PORT} to get started
  `);
});

module.exports = app;
