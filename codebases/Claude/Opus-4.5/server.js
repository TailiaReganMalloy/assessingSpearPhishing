/**
 * Secure Messaging Application - Educational Example
 * 
 * This example demonstrates best practices for:
 * - Secure password storage using bcrypt
 * - Session management with secure cookies
 * - CSRF protection
 * - Rate limiting to prevent brute force attacks
 * - Input validation and sanitization
 * - Security headers with Helmet
 */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const { isAuthenticated } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// =============================================================================
// SECURITY MIDDLEWARE
// =============================================================================

// Helmet adds various HTTP headers for security
// Students: This protects against common web vulnerabilities
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:"],
        },
    },
}));

// Rate limiting to prevent brute force attacks
// Students: This limits how many requests a user can make
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many login attempts. Please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // 100 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(generalLimiter);

// =============================================================================
// VIEW ENGINE & STATIC FILES
// =============================================================================

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// =============================================================================
// BODY PARSING
// =============================================================================

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// =============================================================================
// SESSION CONFIGURATION
// =============================================================================

/**
 * Session Configuration Best Practices:
 * - Use a strong secret (from environment variable)
 * - Set secure: true in production (requires HTTPS)
 * - httpOnly: true prevents JavaScript access to cookies
 * - sameSite: 'strict' prevents CSRF attacks
 * - Store sessions in database, not memory
 */
app.use(session({
    store: new SQLiteStore({
        db: 'sessions.sqlite',
        dir: './database'
    }),
    secret: process.env.SESSION_SECRET || 'change-this-in-production-use-env-variable',
    resave: false,
    saveUninitialized: false,
    name: 'sessionId', // Don't use default 'connect.sid'
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Requires HTTPS in production
        httpOnly: true, // Prevents XSS attacks from accessing cookie
        sameSite: 'strict', // Prevents CSRF attacks
        maxAge: 1000 * 60 * 60 * 2 // 2 hours
    }
}));

// =============================================================================
// CSRF PROTECTION
// =============================================================================

// Make CSRF token available to all views
app.use((req, res, next) => {
    // Generate a simple CSRF token for demonstration
    // In production, use the csurf middleware
    if (!req.session.csrfToken) {
        req.session.csrfToken = require('crypto').randomBytes(32).toString('hex');
    }
    res.locals.csrfToken = req.session.csrfToken;
    next();
});

// CSRF validation middleware
const validateCsrf = (req, res, next) => {
    const token = req.body._csrf || req.headers['x-csrf-token'];
    if (!token || token !== req.session.csrfToken) {
        return res.status(403).render('error', { 
            message: 'Invalid CSRF token. Please refresh and try again.' 
        });
    }
    next();
};

// =============================================================================
// ROUTES
// =============================================================================

// Public routes
app.get('/', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/inbox');
    }
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/inbox');
    }
    res.render('login', { error: null });
});

// Apply rate limiter to login route
app.use('/auth/login', loginLimiter);

// Auth routes (login, logout, register)
app.use('/auth', validateCsrf, authRoutes);

// Protected routes - require authentication
app.use('/inbox', isAuthenticated, messageRoutes);
app.use('/messages', isAuthenticated, validateCsrf, messageRoutes);

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', { message: 'Page not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).render('error', { 
        message: process.env.NODE_ENV === 'production' 
            ? 'An error occurred' 
            : err.message 
    });
});

// =============================================================================
// START SERVER
// =============================================================================

// Initialize database before starting server
const { initializeDatabase } = require('./database/init');
initializeDatabase();

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         Secure Messaging Application - Educational            ║
╠═══════════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${PORT}                     ║
║                                                               ║
║  Demo Accounts:                                               ║
║  • alice@bluemind.net / password123                           ║
║  • bob@bluemind.net / password456                             ║
║  • charlie@bluemind.net / password789                         ║
╚═══════════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
