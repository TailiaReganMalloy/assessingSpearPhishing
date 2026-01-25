const express = require('express');
const { body, validationResult } = require('express-validator');
const { messageDB, userDB } = require('../database');

const router = express.Router();

// Validation middleware
const validateMessage = [
    body('to')
        .isEmail().normalizeEmail()
        .withMessage('Recipient must be a valid email address'),
    body('subject')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Subject is required and must be less than 200 characters'),
    body('content')
        .trim()
        .isLength({ min: 1, max: 5000 })
        .withMessage('Message content is required and must be less than 5000 characters')
];

// Get all messages for the authenticated user
router.get('/', async (req, res) => {
    try {
        const messages = messageDB.getMessagesForUser(req.user.email);
        res.json({ messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Get inbox messages
router.get('/inbox', async (req, res) => {
    try {
        const messages = messageDB.getInbox(req.user.email);
        const unreadCount = messages.filter(m => !m.read).length;
        
        res.json({ 
            messages,
            unreadCount
        });
    } catch (error) {
        console.error('Error fetching inbox:', error);
        res.status(500).json({ error: 'Failed to fetch inbox' });
    }
});

// Get sent messages
router.get('/sent', async (req, res) => {
    try {
        const messages = messageDB.getSent(req.user.email);
        res.json({ messages });
    } catch (error) {
        console.error('Error fetching sent messages:', error);
        res.status(500).json({ error: 'Failed to fetch sent messages' });
    }
});

// Send a new message
router.post('/send', validateMessage, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { to, subject, content } = req.body;
        const normalizedTo = to.toLowerCase();

        // Check if recipient exists
        const recipient = userDB.findByEmail(normalizedTo);
        if (!recipient) {
            return res.status(404).json({ error: 'Recipient not found' });
        }

        // Prevent sending messages to yourself (optional)
        if (normalizedTo === req.user.email) {
            return res.status(400).json({ error: 'You cannot send messages to yourself' });
        }

        // Create message
        const message = messageDB.create({
            from: req.user.email,
            to: normalizedTo,
            subject: subject.trim(),
            content: content.trim()
        });

        res.status(201).json({
            success: true,
            message
        });

    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Mark message as read
router.patch('/:messageId/read', (req, res) => {
    try {
        const { messageId } = req.params;
        const success = messageDB.markAsRead(messageId, req.user.email);
        
        if (success) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Message not found or not authorized' });
        }
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ error: 'Failed to update message' });
    }
});

// Delete a message
router.delete('/:messageId', (req, res) => {
    try {
        const { messageId } = req.params;
        const success = messageDB.delete(messageId, req.user.email);
        
        if (success) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Message not found or not authorized' });
        }
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

// Get list of users (for recipient selection)
router.get('/users', (req, res) => {
    try {
        const users = userDB.getAllUsers()
            .filter(user => user.email !== req.user.email); // Exclude current user
        
        res.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Message statistics (educational endpoint)
router.get('/stats', (req, res) => {
    try {
        const inbox = messageDB.getInbox(req.user.email);
        const sent = messageDB.getSent(req.user.email);
        
        const stats = {
            totalReceived: inbox.length,
            totalSent: sent.length,
            unreadCount: inbox.filter(m => !m.read).length,
            recentActivity: {
                lastReceived: inbox.length > 0 ? inbox[0].createdAt : null,
                lastSent: sent.length > 0 ? sent[0].createdAt : null
            }
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

module.exports = router;