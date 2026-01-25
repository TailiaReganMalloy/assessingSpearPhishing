/**
 * Message Routes
 * 
 * Educational Notes:
 * - Always verify user owns the resource they're accessing
 * - Sanitize all user input to prevent XSS attacks
 * - Use parameterized queries to prevent SQL injection
 * - Implement pagination for large data sets
 */

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { getDatabase } = require('../database/init');

const router = express.Router();

// =============================================================================
// INPUT VALIDATION RULES
// =============================================================================

const messageValidation = [
    body('recipient')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid recipient email'),
    body('subject')
        .trim()
        .isLength({ min: 1, max: 200 })
        .escape()
        .withMessage('Subject must be between 1 and 200 characters'),
    body('body')
        .trim()
        .isLength({ min: 1, max: 10000 })
        .escape()
        .withMessage('Message body must be between 1 and 10000 characters')
];

// =============================================================================
// INBOX - List received messages
// =============================================================================

router.get('/', (req, res) => {
    try {
        const db = getDatabase();
        
        // Get messages for current user with sender info
        // Using parameterized query to prevent SQL injection
        const messages = db.prepare(`
            SELECT 
                m.id,
                m.subject,
                m.body,
                m.is_read,
                m.created_at,
                u.email as sender_email,
                u.display_name as sender_name
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.recipient_id = ?
            ORDER BY m.created_at DESC
        `).all(req.session.userId);

        // Count unread messages
        const unreadCount = db.prepare(`
            SELECT COUNT(*) as count 
            FROM messages 
            WHERE recipient_id = ? AND is_read = 0
        `).get(req.session.userId).count;

        db.close();

        res.render('inbox', { 
            messages,
            unreadCount,
            user: req.session.user
        });

    } catch (error) {
        console.error('Inbox error:', error);
        res.render('error', { message: 'Failed to load inbox' });
    }
});

// =============================================================================
// SENT - List sent messages
// =============================================================================

router.get('/sent', (req, res) => {
    try {
        const db = getDatabase();
        
        const messages = db.prepare(`
            SELECT 
                m.id,
                m.subject,
                m.body,
                m.is_read,
                m.created_at,
                u.email as recipient_email,
                u.display_name as recipient_name
            FROM messages m
            JOIN users u ON m.recipient_id = u.id
            WHERE m.sender_id = ?
            ORDER BY m.created_at DESC
        `).all(req.session.userId);

        db.close();

        res.render('sent', { 
            messages,
            user: req.session.user
        });

    } catch (error) {
        console.error('Sent messages error:', error);
        res.render('error', { message: 'Failed to load sent messages' });
    }
});

// =============================================================================
// VIEW MESSAGE - Read a single message
// =============================================================================

router.get('/view/:id', [
    param('id').isInt().withMessage('Invalid message ID')
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('error', { message: 'Invalid message ID' });
        }

        const messageId = parseInt(req.params.id);
        const db = getDatabase();
        
        // Get message with sender info
        // SECURITY: Only allow viewing messages sent TO or FROM the current user
        const message = db.prepare(`
            SELECT 
                m.*,
                sender.email as sender_email,
                sender.display_name as sender_name,
                recipient.email as recipient_email,
                recipient.display_name as recipient_name
            FROM messages m
            JOIN users sender ON m.sender_id = sender.id
            JOIN users recipient ON m.recipient_id = recipient.id
            WHERE m.id = ? AND (m.recipient_id = ? OR m.sender_id = ?)
        `).get(messageId, req.session.userId, req.session.userId);

        if (!message) {
            db.close();
            return res.render('error', { message: 'Message not found' });
        }

        // Mark as read if recipient is viewing
        if (message.recipient_id === req.session.userId && !message.is_read) {
            db.prepare('UPDATE messages SET is_read = 1 WHERE id = ?').run(messageId);
        }

        db.close();

        res.render('message', { 
            message,
            user: req.session.user
        });

    } catch (error) {
        console.error('View message error:', error);
        res.render('error', { message: 'Failed to load message' });
    }
});

// =============================================================================
// COMPOSE - Show compose form
// =============================================================================

router.get('/compose', (req, res) => {
    const replyTo = req.query.replyTo || '';
    const subject = req.query.subject || '';
    
    res.render('compose', { 
        user: req.session.user,
        replyTo,
        subject,
        error: null,
        success: null
    });
});

// =============================================================================
// SEND MESSAGE - Create and send a new message
// =============================================================================

router.post('/send', messageValidation, (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('compose', {
                user: req.session.user,
                replyTo: req.body.recipient,
                subject: req.body.subject,
                error: errors.array()[0].msg,
                success: null
            });
        }

        const { recipient, subject, body } = req.body;
        const db = getDatabase();

        // Find recipient by email
        const recipientUser = db.prepare('SELECT id FROM users WHERE email = ?').get(recipient);

        if (!recipientUser) {
            db.close();
            return res.render('compose', {
                user: req.session.user,
                replyTo: recipient,
                subject,
                error: 'Recipient not found',
                success: null
            });
        }

        // Prevent sending to self (optional restriction)
        if (recipientUser.id === req.session.userId) {
            db.close();
            return res.render('compose', {
                user: req.session.user,
                replyTo: recipient,
                subject,
                error: 'Cannot send message to yourself',
                success: null
            });
        }

        // Insert message
        db.prepare(`
            INSERT INTO messages (sender_id, recipient_id, subject, body)
            VALUES (?, ?, ?, ?)
        `).run(req.session.userId, recipientUser.id, subject, body);

        db.close();

        res.render('compose', {
            user: req.session.user,
            replyTo: '',
            subject: '',
            error: null,
            success: 'Message sent successfully!'
        });

    } catch (error) {
        console.error('Send message error:', error);
        res.render('compose', {
            user: req.session.user,
            replyTo: req.body.recipient || '',
            subject: req.body.subject || '',
            error: 'Failed to send message',
            success: null
        });
    }
});

// =============================================================================
// DELETE MESSAGE
// =============================================================================

router.post('/delete/:id', [
    param('id').isInt().withMessage('Invalid message ID')
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.redirect('/inbox');
        }

        const messageId = parseInt(req.params.id);
        const db = getDatabase();

        // SECURITY: Only allow deleting messages that belong to the user
        const message = db.prepare(`
            SELECT id FROM messages 
            WHERE id = ? AND (recipient_id = ? OR sender_id = ?)
        `).get(messageId, req.session.userId, req.session.userId);

        if (message) {
            db.prepare('DELETE FROM messages WHERE id = ?').run(messageId);
        }

        db.close();
        res.redirect('/inbox');

    } catch (error) {
        console.error('Delete message error:', error);
        res.redirect('/inbox');
    }
});

module.exports = router;
