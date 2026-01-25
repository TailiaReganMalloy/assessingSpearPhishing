const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { userDB, loginAttemptsDB } = require('../database');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateLogin = [
    body('email')
        .isEmail().normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    body('rememberMe')
        .optional()
        .isBoolean()
        .withMessage('Remember me must be a boolean')
];

const validateRegister = [
    body('email')
        .isEmail().normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9\s]+$/)
        .withMessage('Username can only contain letters, numbers, and spaces'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

// Login endpoint
router.post('/login', validateLogin, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, rememberMe } = req.body;
        const normalizedEmail = email.toLowerCase();

        // Check if account is locked
        if (loginAttemptsDB.isLocked(normalizedEmail)) {
            const attemptsInfo = loginAttemptsDB.getAttemptsInfo(normalizedEmail);
            const remainingTime = Math.ceil((attemptsInfo.lockedUntil - new Date()) / 60000);
            return res.status(429).json({ 
                error: `Account is locked due to too many failed attempts. Please try again in ${remainingTime} minutes.` 
            });
        }

        // Find user
        const user = userDB.findByEmail(normalizedEmail);
        if (!user) {
            loginAttemptsDB.recordAttempt(normalizedEmail, false);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            loginAttemptsDB.recordAttempt(normalizedEmail, false);
            const attemptsInfo = loginAttemptsDB.getAttemptsInfo(normalizedEmail);
            const remainingAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || 5) - attemptsInfo.count;
            
            return res.status(401).json({ 
                error: 'Invalid email or password',
                remainingAttempts: remainingAttempts > 0 ? remainingAttempts : 0
            });
        }

        // Login successful - clear login attempts
        loginAttemptsDB.recordAttempt(normalizedEmail, true);

        // Generate JWT token
        const token = generateToken(user);

        // Set cookie options
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 days or 24 hours
        };

        res.cookie('token', token, cookieOptions);

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An error occurred during login' });
    }
});

// Register endpoint
router.post('/register', validateRegister, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, username, password } = req.body;
        const normalizedEmail = email.toLowerCase();

        // Check if user already exists
        if (userDB.findByEmail(normalizedEmail)) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Create new user
        const newUser = await userDB.create({
            email: normalizedEmail,
            username: username.trim(),
            password
        });

        // Generate JWT token
        const token = generateToken(newUser);

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.status(201).json({
            success: true,
            user: newUser
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'An error occurred during registration' });
    }
});

// Logout endpoint
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
});

// Check authentication status
router.get('/status', authenticateToken, (req, res) => {
    res.json({
        authenticated: true,
        user: req.user
    });
});

// Password strength checker (educational endpoint)
router.post('/check-password-strength', (req, res) => {
    const { password } = req.body;
    
    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    const strength = {
        score: 0,
        feedback: []
    };

    // Length check
    if (password.length >= 8) strength.score += 20;
    if (password.length >= 12) strength.score += 10;
    if (password.length < 8) strength.feedback.push('Use at least 8 characters');

    // Complexity checks
    if (/[a-z]/.test(password)) strength.score += 15;
    else strength.feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) strength.score += 15;
    else strength.feedback.push('Include uppercase letters');

    if (/\d/.test(password)) strength.score += 15;
    else strength.feedback.push('Include numbers');

    if (/[@$!%*?&]/.test(password)) strength.score += 15;
    else strength.feedback.push('Include special characters');

    // Common patterns to avoid
    if (!/(.)\1{2,}/.test(password)) strength.score += 10;
    else strength.feedback.push('Avoid repeated characters');

    if (!/(?:password|123456|qwerty)/i.test(password)) strength.score += 10;
    else strength.feedback.push('Avoid common passwords');

    // Determine strength level
    let level = 'Weak';
    if (strength.score >= 80) level = 'Strong';
    else if (strength.score >= 60) level = 'Moderate';

    res.json({
        score: strength.score,
        level,
        feedback: strength.feedback
    });
});

module.exports = router;