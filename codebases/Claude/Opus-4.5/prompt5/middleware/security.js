// Security middleware for educational purposes
const rateLimit = require('express-rate-limit');

// Rate limiting middleware
const loginLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 5, // 5 attempts per window
    message: {
        error: 'Too many login attempts, please try again later.',
        retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 60000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip successful requests
    skipSuccessfulRequests: true,
    // Only count failed login attempts
    skip: (req, res) => res.statusCode < 400
});

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.redirect('/login?message=Please log in to continue');
    }
};

// Prevent authenticated users from accessing login/register
const preventAuthAccess = (req, res, next) => {
    if (req.session && req.session.userId) {
        res.redirect('/dashboard');
    } else {
        next();
    }
};

// Log security events for educational purposes
const securityLogger = (event, req, details = {}) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        event,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        session: req.session ? req.session.id : 'none',
        userId: req.session ? req.session.userId : 'anonymous',
        ...details
    };
    
    console.log('SECURITY EVENT:', JSON.stringify(logEntry, null, 2));
    // In a real application, you would write this to a secure log file
};

module.exports = {
    loginLimiter,
    requireAuth,
    preventAuthAccess,
    securityLogger
};