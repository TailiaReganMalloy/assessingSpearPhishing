require('dotenv').config();

const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const path = require('path');

// Initialize database
const Database = require('./database/database');
const database = new Database();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for proper IP detection
app.set('trust proxy', 1);

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// Body parsing middleware
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true, // Prevent XSS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours (overridden by computer type)
        sameSite: 'lax' // CSRF protection
    },
    name: 'bluemind.sid' // Custom session name for security
}));

// CSRF protection middleware
const csrfProtection = csrf({ cookie: false });

// Security logging middleware
app.use((req, res, next) => {
    // Log all requests for educational purposes
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip} - User-Agent: ${req.get('User-Agent')}`);
    next();
});

// Apply CSRF protection to all routes except GET requests to login/register pages
app.use((req, res, next) => {
    if (req.method === 'GET' && (req.path === '/login' || req.path === '/register' || req.path === '/')) {
        next();
    } else {
        csrfProtection(req, res, next);
    }
});

// Routes
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');

app.use('/', authRoutes);
app.use('/', messageRoutes);

// Root route
app.get('/', (req, res) => {
    if (req.session && req.session.userId) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Application Error:', err);

    // CSRF token errors
    if (err.code === 'EBADCSRFTOKEN') {
        res.status(403);
        return res.render('login', {
            error: 'Invalid security token. Please try again.',
            message: '',
            csrfToken: req.csrfToken ? req.csrfToken() : ''
        });
    }

    // Rate limiting errors
    if (err.status === 429) {
        res.status(429);
        return res.render('login', {
            error: 'Too many requests. Please try again later.',
            message: '',
            csrfToken: req.csrfToken ? req.csrfToken() : ''
        });
    }

    // Generic error handling
    res.status(err.status || 500);
    
    if (process.env.NODE_ENV === 'development') {
        res.json({
            error: err.message,
            stack: err.stack,
            details: 'This detailed error is shown because NODE_ENV is set to development'
        });
    } else {
        res.render('login', {
            error: 'Something went wrong. Please try again.',
            message: '',
            csrfToken: req.csrfToken ? req.csrfToken() : ''
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('login', {
        error: 'Page not found',
        message: '',
        csrfToken: req.csrfToken ? req.csrfToken() : ''
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    database.close();
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    console.log(`🔒 BlueMind Security Demo Server running on port ${PORT}`);
    console.log(`📚 Educational web security application`);
    console.log(`🌐 Visit: http://localhost:${PORT}`);
    console.log(`\n📋 Demo Credentials:`);
    console.log(`   Email: admin@bluemind.net | Password: SecurePass123!`);
    console.log(`   Email: user1@bluemind.net | Password: UserPass456!`);
    console.log(`   Email: user2@bluemind.net | Password: TestPass789!`);
    console.log(`\n🔐 Security Features Implemented:`);
    console.log(`   ✅ Password hashing with bcrypt (${process.env.BCRYPT_ROUNDS || 12} rounds)`);
    console.log(`   ✅ Session management with secure cookies`);
    console.log(`   ✅ Rate limiting to prevent brute force attacks`);
    console.log(`   ✅ CSRF protection on all forms`);
    console.log(`   ✅ Input validation and sanitization`);
    console.log(`   ✅ XSS prevention with HTML sanitization`);
    console.log(`   ✅ Security headers with Helmet.js`);
    console.log(`   ✅ SQL injection prevention with parameterized queries`);
    console.log(`   ✅ Account lockout after failed attempts`);
    console.log(`   ✅ Session duration based on computer type`);
    console.log(`   ✅ Comprehensive security event logging`);
    console.log(`\n📖 Check the browser console and server logs for educational security insights!`);
});

module.exports = app;