"use strict";

const { doubleCsrf } = require('csrf-csrf');
const { generateToken, validateToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: (req) => req.session.csrfSecret || '',
    cookieName: 'X-CSRF-Token',
    cookieOptions: {
        httpOnly: true,
        sameSite: 'strict',
        secure: false // Set to true in production with HTTPS
    },
    size: 64,
    getTokenFromRequest: (req) => {
        // Try to get token from header first
        const headerToken = req.headers['x-csrf-token'];
        if (headerToken) return headerToken;
        
        // Fall back to body
        return req.body['_csrf'];
    }
});

module.exports = {
    generateToken,
    validateToken,
    doubleCsrfProtection
};