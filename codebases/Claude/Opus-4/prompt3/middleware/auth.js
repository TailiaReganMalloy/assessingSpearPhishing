const jwt = require('jsonwebtoken');
const { userDB } = require('../database');

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    // Check for token in cookies first (more secure), then Authorization header
    const token = req.cookies.token || extractBearerToken(req.headers.authorization);
    
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            // Clear invalid token from cookies
            res.clearCookie('token');
            
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired. Please login again.' });
            }
            return res.status(403).json({ error: 'Invalid token' });
        }
        
        // Verify user still exists
        const user = userDB.findById(decoded.userId);
        if (!user) {
            res.clearCookie('token');
            return res.status(401).json({ error: 'User not found' });
        }
        
        // Attach user info to request
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            username: decoded.username
        };
        
        next();
    });
}

// Extract bearer token from Authorization header
function extractBearerToken(authHeader) {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
        return parts[1];
    }
    
    return null;
}

// Middleware for optional authentication (doesn't fail if no token)
function optionalAuth(req, res, next) {
    const token = req.cookies.token || extractBearerToken(req.headers.authorization);
    
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (!err) {
                const user = userDB.findById(decoded.userId);
                if (user) {
                    req.user = {
                        id: decoded.userId,
                        email: decoded.email,
                        username: decoded.username
                    };
                }
            }
        });
    }
    
    next();
}

// Generate JWT token
function generateToken(user) {
    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
            username: user.username
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE || '24h'
        }
    );
}

module.exports = {
    authenticateToken,
    optionalAuth,
    generateToken
};