const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { 
    generateToken, 
    loginLimiter, 
    redirectIfAuthenticated 
} = require('../middleware/auth');
const { 
    validateRegistration, 
    validateLogin, 
    handleValidationErrors 
} = require('../middleware/validation');

// POST /api/auth/login
router.post('/login', 
    loginLimiter,
    validateLogin,
    handleValidationErrors,
    async (req, res) => {
        try {
            const { email, password, rememberDevice } = req.body;
            const userModel = new User();

            // Find user by email
            const user = await userModel.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    error: 'Invalid email or password'
                });
            }

            // Check if account is locked
            const isLocked = await userModel.isAccountLocked(user.id);
            if (isLocked) {
                return res.status(423).json({
                    error: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
                });
            }

            // Verify password
            const isPasswordValid = await userModel.verifyPassword(password, user.password_hash);
            if (!isPasswordValid) {
                // Increment failed attempts
                await userModel.incrementFailedAttempts(user.id);
                return res.status(401).json({
                    error: 'Invalid email or password'
                });
            }

            // Successful login
            await userModel.updateLastLogin(user.id);

            // Generate JWT token
            const token = generateToken(user);

            // Set session data
            req.session.userId = user.id;
            req.session.token = token;
            
            // Set secure cookie if remember device is checked
            if (rememberDevice) {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
            }

            res.json({
                success: true,
                message: 'Login successful',
                token: token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                error: 'An error occurred during login. Please try again.'
            });
        }
    }
);

// POST /api/auth/register
router.post('/register',
    validateRegistration,
    handleValidationErrors,
    async (req, res) => {
        try {
            const { email, password, firstName, lastName } = req.body;
            const userModel = new User();

            // Check if user already exists
            const existingUser = await userModel.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    error: 'A user with this email already exists'
                });
            }

            // Create new user
            const newUser = await userModel.create({
                email,
                password,
                firstName,
                lastName
            });

            // Generate token for immediate login after registration
            const token = generateToken(newUser);

            // Set session data
            req.session.userId = newUser.id;
            req.session.token = token;

            res.status(201).json({
                success: true,
                message: 'Registration successful',
                token: token,
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName
                }
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                error: 'An error occurred during registration. Please try again.'
            });
        }
    }
);

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({
                error: 'Error logging out'
            });
        }
        
        res.clearCookie('connect.sid'); // Clear session cookie
        res.json({
            success: true,
            message: 'Logout successful'
        });
    });
});

// GET /api/auth/me - Get current user info
router.get('/me', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                error: 'Not authenticated'
            });
        }

        const userModel = new User();
        const user = await userModel.findById(req.session.userId);
        
        if (!user) {
            req.session.destroy();
            return res.status(401).json({
                error: 'User not found'
            });
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                lastLogin: user.last_login
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            error: 'Error retrieving user information'
        });
    }
});

module.exports = router;