const jwt = require('jsonwebtoken');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

// JWT Secret (In production, use environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-secret-key-change-in-production';

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1] || req.session.token;

    if (!token) {
        return res.status(401).json({ 
            error: 'Access denied. No token provided.',
            redirect: '/login'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                error: 'Invalid or expired token.',
                redirect: '/login'
            });
        }
        
        req.user = user;
        next();
    });
}

// Optional authentication middleware (doesn't redirect if no token)
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1] || req.session.token;

    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (!err) {
                req.user = user;
            }
        });
    }
    next();
}

// Rate limiting for login attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        error: 'Too many login attempts from this IP, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many API requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Generate JWT token
function generateToken(user) {
    return jwt.sign({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
    }, JWT_SECRET, { 
        expiresIn: '24h' 
    });
}

// Verify JWT token
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

// Session validation middleware
async function validateSession(req, res, next) {
    if (req.session && req.session.userId) {
        try {
            const userModel = new User();
            const user = await userModel.findById(req.session.userId);
            
            if (user) {
                req.user = user;
                next();
            } else {
                // User no longer exists, destroy session
                req.session.destroy();
                res.redirect('/login');
            }
        } catch (error) {
            console.error('Session validation error:', error);
            req.session.destroy();
            res.redirect('/login');
        }
    } else {
        res.redirect('/login');
    }
}

// Check if user is already authenticated (for login page)
function redirectIfAuthenticated(req, res, next) {
    if ((req.session && req.session.userId) || req.user) {
        return res.redirect('/dashboard');
    }
    next();
}

// Security headers middleware
function securityHeaders(req, res, next) {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Strict transport security (HTTPS only in production)
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    next();
}

// Input sanitization middleware
function sanitizeInput(req, res, next) {
    // Basic input sanitization
    const sanitize = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === 'string') {
                // Remove potentially dangerous characters
                obj[key] = obj[key].trim();
                // Basic XSS prevention
                obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                obj[key] = obj[key].replace(/javascript:/gi, '');
                obj[key] = obj[key].replace(/on\w+="/gi, '');
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitize(obj[key]);
            }
        }
    };

    if (req.body) sanitize(req.body);
    if (req.query) sanitize(req.query);
    if (req.params) sanitize(req.params);
    
    next();
}

module.exports = {
    authenticateToken,
    optionalAuth,
    loginLimiter,
    apiLimiter,
    generateToken,
    verifyToken,
    validateSession,
    redirectIfAuthenticated,
    securityHeaders,
    sanitizeInput,
    JWT_SECRET
};