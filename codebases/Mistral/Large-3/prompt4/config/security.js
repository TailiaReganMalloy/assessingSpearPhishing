"use strict";

module.exports = {
    // Session settings
    session: {
        secret: 'your-secret-key-here', // Change this in production!
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: false // Set to true in production with HTTPS
    },
    
    // Password settings
    password: {
        saltRounds: 12 // Number of bcrypt salt rounds
    },
    
    // CSRF protection - using alternative to deprecated csurf
    csrf: {
        protection: true
    },
    
    // Rate limiting
    rateLimiting: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    }
};