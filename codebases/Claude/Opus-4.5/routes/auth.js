/**
 * Authentication Routes
 * 
 * Educational Notes:
 * - Always hash passwords before storing (using bcrypt)
 * - Use bcrypt.compare() to verify passwords - NEVER compare plain text
 * - Implement account lockout after failed attempts
 * - Use constant-time comparison to prevent timing attacks
 * - Always sanitize and validate user input
 */

const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../database/init');

const router = express.Router();

// =============================================================================
// INPUT VALIDATION RULES
// =============================================================================

const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email address'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const registerValidation = [
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email address'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/\d/)
        .withMessage('Password must contain at least one number'),
    body('displayName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .escape()
        .withMessage('Display name must be between 2 and 50 characters')
];

// =============================================================================
// LOGIN ROUTE
// =============================================================================

router.post('/login', loginValidation, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('login', { 
                error: errors.array()[0].msg 
            });
        }

        const { email, password } = req.body;
        const db = getDatabase();

        // Find user by email
        const user = db.prepare(`
            SELECT id, email, password_hash, display_name, failed_login_attempts, locked_until 
            FROM users 
            WHERE email = ?
        `).get(email);

        // =================================================================
        // SECURITY: Check if account is locked
        // =================================================================
        if (user && user.locked_until) {
            const lockExpiry = new Date(user.locked_until);
            if (lockExpiry > new Date()) {
                db.close();
                return res.render('login', {
                    error: `Account is locked. Try again after ${lockExpiry.toLocaleTimeString()}`
                });
            }
        }

        // =================================================================
        // SECURITY: Verify password with bcrypt
        // bcrypt.compare is constant-time to prevent timing attacks
        // =================================================================
        if (!user) {
            // SECURITY: Don't reveal if email exists or not
            // Still do a dummy comparison to prevent timing attacks
            await bcrypt.compare(password, '$2b$10$dummy.hash.to.prevent.timing.attacks');
            db.close();
            return res.render('login', { 
                error: 'Invalid email or password' 
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            // Increment failed login attempts
            const newAttempts = (user.failed_login_attempts || 0) + 1;
            
            // Lock account after 5 failed attempts
            if (newAttempts >= 5) {
                const lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
                db.prepare(`
                    UPDATE users 
                    SET failed_login_attempts = ?, locked_until = ? 
                    WHERE id = ?
                `).run(newAttempts, lockUntil.toISOString(), user.id);
                
                db.close();
                return res.render('login', {
                    error: 'Account locked due to too many failed attempts. Try again in 15 minutes.'
                });
            }

            db.prepare(`
                UPDATE users 
                SET failed_login_attempts = ? 
                WHERE id = ?
            `).run(newAttempts, user.id);

            db.close();
            return res.render('login', { 
                error: 'Invalid email or password' 
            });
        }

        // =================================================================
        // SUCCESSFUL LOGIN
        // =================================================================

        // Reset failed attempts and update last login
        db.prepare(`
            UPDATE users 
            SET failed_login_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP 
            WHERE id = ?
        `).run(user.id);

        db.close();

        // Regenerate session to prevent session fixation attacks
        req.session.regenerate((err) => {
            if (err) {
                console.error('Session regeneration error:', err);
                return res.render('login', { error: 'An error occurred. Please try again.' });
            }

            // Store user info in session
            req.session.userId = user.id;
            req.session.user = {
                id: user.id,
                email: user.email,
                displayName: user.display_name
            };

            // Generate new CSRF token for the new session
            req.session.csrfToken = require('crypto').randomBytes(32).toString('hex');

            // Redirect to originally requested page or inbox
            const returnTo = req.session.returnTo || '/inbox';
            delete req.session.returnTo;
            res.redirect(returnTo);
        });

    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { error: 'An error occurred. Please try again.' });
    }
});

// =============================================================================
// REGISTER ROUTE
// =============================================================================

router.get('/register', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/inbox');
    }
    res.render('register', { error: null, success: null });
});

router.post('/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('register', { 
                error: errors.array()[0].msg,
                success: null 
            });
        }

        const { email, password, displayName } = req.body;
        const db = getDatabase();

        // Check if email already exists
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existingUser) {
            db.close();
            return res.render('register', { 
                error: 'An account with this email already exists',
                success: null 
            });
        }

        // =================================================================
        // SECURITY: Hash password with bcrypt
        // Salt rounds of 10-12 is recommended for most applications
        // Higher values = more secure but slower
        // =================================================================
        const SALT_ROUNDS = 10;
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Insert new user
        db.prepare(`
            INSERT INTO users (email, password_hash, display_name) 
            VALUES (?, ?, ?)
        `).run(email, passwordHash, displayName);

        db.close();

        res.render('register', { 
            error: null,
            success: 'Account created successfully! You can now log in.' 
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.render('register', { 
            error: 'An error occurred. Please try again.',
            success: null 
        });
    }
});

// =============================================================================
// LOGOUT ROUTE
// =============================================================================

router.post('/logout', (req, res) => {
    // Destroy session completely
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        // Clear the session cookie
        res.clearCookie('sessionId');
        res.redirect('/login');
    });
});

// GET logout for convenience (redirect to POST)
router.get('/logout', (req, res) => {
    res.render('logout');
});

module.exports = router;
