const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users - Get all users (for recipient selection)
router.get('/', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const userModel = new User();
        const users = await userModel.getAllUsers(req.session.userId);

        res.json({
            success: true,
            users: users.map(user => ({
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                displayName: `${user.first_name} ${user.last_name} (${user.email})`
            }))
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            error: 'Error retrieving users'
        });
    }
});

// GET /api/users/me - Get current user profile
router.get('/me', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const userModel = new User();
        const user = await userModel.findById(req.session.userId);

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                createdAt: user.created_at,
                lastLogin: user.last_login
            }
        });

    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            error: 'Error retrieving user profile'
        });
    }
});

module.exports = router;