const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { validateMessage, validateMessageId, handleValidationErrors } = require('../middleware/validation');

// GET /api/messages/inbox - Get user's inbox
router.get('/inbox', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const messageModel = new Message();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const messages = await messageModel.getMessagesForUser(req.session.userId, limit, offset);

        res.json({
            success: true,
            messages: messages,
            page: page,
            hasMore: messages.length === limit
        });

    } catch (error) {
        console.error('Get inbox error:', error);
        res.status(500).json({
            error: 'Error retrieving messages'
        });
    }
});

// GET /api/messages/sent - Get user's sent messages
router.get('/sent', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const messageModel = new Message();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const messages = await messageModel.getSentMessages(req.session.userId, limit, offset);

        res.json({
            success: true,
            messages: messages,
            page: page,
            hasMore: messages.length === limit
        });

    } catch (error) {
        console.error('Get sent messages error:', error);
        res.status(500).json({
            error: 'Error retrieving sent messages'
        });
    }
});

// GET /api/messages/:id - Get specific message
router.get('/:id', validateMessageId, async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const messageModel = new Message();
        const message = await messageModel.getMessageById(req.params.id, req.session.userId);

        if (!message) {
            return res.status(404).json({
                error: 'Message not found or you do not have permission to view it'
            });
        }

        // Mark as read if user is the recipient
        if (message.recipient_email === req.session.email && !message.read_at) {
            await messageModel.markAsRead(req.params.id, req.session.userId);
        }

        res.json({
            success: true,
            message: message
        });

    } catch (error) {
        console.error('Get message error:', error);
        res.status(500).json({
            error: 'Error retrieving message'
        });
    }
});

// POST /api/messages - Send a new message
router.post('/', 
    validateMessage,
    handleValidationErrors,
    async (req, res) => {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ error: 'Not authenticated' });
            }

            const { recipientId, subject, content } = req.body;

            // Verify recipient exists
            const userModel = new User();
            const recipient = await userModel.findById(recipientId);
            
            if (!recipient) {
                return res.status(400).json({
                    error: 'Recipient not found'
                });
            }

            // Prevent sending messages to self
            if (recipientId === req.session.userId) {
                return res.status(400).json({
                    error: 'Cannot send message to yourself'
                });
            }

            const messageModel = new Message();
            const newMessage = await messageModel.create({
                senderId: req.session.userId,
                recipientId: recipientId,
                subject: subject.trim(),
                content: content.trim()
            });

            res.status(201).json({
                success: true,
                message: 'Message sent successfully',
                messageId: newMessage.id
            });

        } catch (error) {
            console.error('Send message error:', error);
            res.status(500).json({
                error: 'Error sending message'
            });
        }
    }
);

// PUT /api/messages/:id/read - Mark message as read
router.put('/:id/read', validateMessageId, async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const messageModel = new Message();
        const success = await messageModel.markAsRead(req.params.id, req.session.userId);

        if (!success) {
            return res.status(404).json({
                error: 'Message not found or already read'
            });
        }

        res.json({
            success: true,
            message: 'Message marked as read'
        });

    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            error: 'Error marking message as read'
        });
    }
});

// DELETE /api/messages/:id - Delete a message
router.delete('/:id', validateMessageId, async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const messageModel = new Message();
        const success = await messageModel.deleteMessage(req.params.id, req.session.userId);

        if (!success) {
            return res.status(404).json({
                error: 'Message not found or you do not have permission to delete it'
            });
        }

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });

    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({
            error: 'Error deleting message'
        });
    }
});

// GET /api/messages/unread/count - Get unread message count
router.get('/unread/count', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const messageModel = new Message();
        const count = await messageModel.getUnreadCount(req.session.userId);

        res.json({
            success: true,
            count: count
        });

    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            error: 'Error retrieving unread count'
        });
    }
});

module.exports = router;