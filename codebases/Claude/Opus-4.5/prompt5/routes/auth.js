const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { loginLimiter, preventAuthAccess, securityLogger } = require('../middleware/security');
const Database = require('../database/database');

const router = express.Router();

// Login page
router.get('/login', preventAuthAccess, (req, res) => {
    const message = req.query.message || '';
    const error = req.query.error || '';
    res.render('login', { 
        message, 
        error,
        csrfToken: req.csrfToken() 
    });
});

// Login POST with security features
router.post('/login', 
    loginLimiter,
    preventAuthAccess,
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please enter a valid email address'),
        body('password')
            .isLength({ min: 1 })
            .withMessage('Password is required'),
        body('computerType')
            .optional()
            .isIn(['private', 'public'])
            .withMessage('Invalid computer type')
    ],
    async (req, res) => {
        try {
            // Validate input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                securityLogger('VALIDATION_FAILED', req, { errors: errors.array() });
                return res.render('login', {
                    error: 'Invalid input provided',
                    message: '',
                    csrfToken: req.csrfToken()
                });
            }

            const { email, password, computerType = 'private' } = req.body;
            const db = new Database().getDB();

            // Get user from database
            db.get(
                'SELECT * FROM users WHERE email = ? AND is_active = 1',
                [email],
                async (err, user) => {
                    if (err) {
                        console.error('Database error during login:', err);
                        securityLogger('DB_ERROR', req, { error: err.message });
                        return res.render('login', {
                            error: 'System error, please try again',
                            message: '',
                            csrfToken: req.csrfToken()
                        });
                    }

                    // Check if user exists
                    if (!user) {
                        securityLogger('LOGIN_ATTEMPT_INVALID_USER', req, { email });
                        return res.render('login', {
                            error: 'Invalid email or password',
                            message: '',
                            csrfToken: req.csrfToken()
                        });
                    }

                    // Check if account is locked
                    if (user.locked_until && new Date(user.locked_until) > new Date()) {
                        securityLogger('LOGIN_ATTEMPT_LOCKED_ACCOUNT', req, { userId: user.id });
                        return res.render('login', {
                            error: 'Account temporarily locked due to multiple failed attempts',
                            message: '',
                            csrfToken: req.csrfToken()
                        });
                    }

                    // Verify password
                    const isValidPassword = await bcrypt.compare(password, user.password_hash);
                    
                    if (!isValidPassword) {
                        // Increment failed attempts
                        const newAttempts = (user.login_attempts || 0) + 1;
                        const lockUntil = newAttempts >= 5 ? 
                            new Date(Date.now() + 15 * 60 * 1000) : // Lock for 15 minutes
                            null;

                        db.run(
                            'UPDATE users SET login_attempts = ?, locked_until = ? WHERE id = ?',
                            [newAttempts, lockUntil, user.id]
                        );

                        securityLogger('LOGIN_FAILED', req, { 
                            userId: user.id, 
                            attempts: newAttempts,
                            locked: !!lockUntil 
                        });

                        return res.render('login', {
                            error: 'Invalid email or password',
                            message: '',
                            csrfToken: req.csrfToken()
                        });
                    }

                    // Successful login
                    // Reset failed attempts
                    db.run(
                        'UPDATE users SET login_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP WHERE id = ?',
                        [user.id]
                    );

                    // Create session
                    req.session.userId = user.id;
                    req.session.userEmail = user.email;
                    req.session.computerType = computerType;

                    // Set session duration based on computer type
                    if (computerType === 'public') {
                        req.session.cookie.maxAge = 30 * 60 * 1000; // 30 minutes for public computers
                    } else {
                        req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours for private computers
                    }

                    // Log session
                    db.run(
                        'INSERT INTO user_sessions (user_id, session_id, ip_address, user_agent) VALUES (?, ?, ?, ?)',
                        [user.id, req.session.id, req.ip, req.get('User-Agent')]
                    );

                    securityLogger('LOGIN_SUCCESS', req, { 
                        userId: user.id, 
                        computerType,
                        sessionDuration: req.session.cookie.maxAge 
                    });

                    res.redirect('/dashboard');
                }
            );
        } catch (error) {
            console.error('Login error:', error);
            securityLogger('LOGIN_ERROR', req, { error: error.message });
            res.render('login', {
                error: 'System error, please try again',
                message: '',
                csrfToken: req.csrfToken()
            });
        }
    }
);

// Registration page (for demo purposes)
router.get('/register', preventAuthAccess, (req, res) => {
    res.render('register', { 
        message: '',
        error: '',
        csrfToken: req.csrfToken() 
    });
});

// Registration POST
router.post('/register',
    preventAuthAccess,
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please enter a valid email address'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
            .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
        body('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Password confirmation does not match password');
                }
                return value;
            })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.render('register', {
                    error: errors.array()[0].msg,
                    message: '',
                    csrfToken: req.csrfToken()
                });
            }

            const { email, password } = req.body;
            const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
            const db = new Database().getDB();

            db.run(
                'INSERT INTO users (email, password_hash) VALUES (?, ?)',
                [email, hashedPassword],
                function(err) {
                    if (err) {
                        if (err.message.includes('UNIQUE constraint failed')) {
                            return res.render('register', {
                                error: 'Email already exists',
                                message: '',
                                csrfToken: req.csrfToken()
                            });
                        } else {
                            console.error('Registration error:', err);
                            return res.render('register', {
                                error: 'System error, please try again',
                                message: '',
                                csrfToken: req.csrfToken()
                            });
                        }
                    }

                    securityLogger('USER_REGISTERED', req, { userId: this.lastID, email });
                    res.redirect('/login?message=Registration successful! Please log in.');
                }
            );
        } catch (error) {
            console.error('Registration error:', error);
            res.render('register', {
                error: 'System error, please try again',
                message: '',
                csrfToken: req.csrfToken()
            });
        }
    }
);

// Logout
router.post('/logout', (req, res) => {
    if (req.session) {
        const userId = req.session.userId;
        
        // Mark session as inactive
        if (userId) {
            const db = new Database().getDB();
            db.run(
                'UPDATE user_sessions SET is_active = 0 WHERE session_id = ?',
                [req.session.id]
            );
            
            securityLogger('LOGOUT', req, { userId });
        }

        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
            }
            res.clearCookie('connect.sid');
            res.redirect('/login?message=Logged out successfully');
        });
    } else {
        res.redirect('/login');
    }
});

module.exports = router;