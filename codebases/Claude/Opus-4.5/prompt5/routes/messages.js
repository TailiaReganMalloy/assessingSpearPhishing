const express = require('express');
const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const { requireAuth, securityLogger } = require('../middleware/security');
const Database = require('../database/database');

const router = express.Router();

// Dashboard route
router.get('/dashboard', requireAuth, (req, res) => {
    const db = new Database().getDB();
    const userId = req.session.userId;
    
    // Get user statistics
    const stats = {
        totalUsers: 0,
        unreadMessages: 0,
        totalMessages: 0,
        activeSessions: 0
    };

    // Get total users
    db.get('SELECT COUNT(*) as count FROM users WHERE is_active = 1', (err, result) => {
        if (!err) stats.totalUsers = result.count;
        
        // Get unread messages for current user
        db.get('SELECT COUNT(*) as count FROM messages WHERE recipient_id = ? AND read_at IS NULL', [userId], (err, result) => {
            if (!err) stats.unreadMessages = result.count;
            
            // Get total messages for current user
            db.get('SELECT COUNT(*) as count FROM messages WHERE recipient_id = ?', [userId], (err, result) => {
                if (!err) stats.totalMessages = result.count;
                
                // Get active sessions
                db.get('SELECT COUNT(*) as count FROM user_sessions WHERE is_active = 1', (err, result) => {
                    if (!err) stats.activeSessions = result.count;
                    
                    // Get recent messages
                    db.all(`
                        SELECT m.*, u.email as sender_email 
                        FROM messages m 
                        JOIN users u ON m.sender_id = u.id 
                        WHERE m.recipient_id = ? 
                        ORDER BY m.created_at DESC 
                        LIMIT 10
                    `, [userId], (err, messages) => {
                        if (err) {
                            console.error('Error fetching messages:', err);
                            messages = [];
                        }

                        // Get user info for session details
                        db.get('SELECT last_login FROM users WHERE id = ?', [userId], (err, user) => {
                            res.render('dashboard', {
                                stats,
                                messages,
                                userEmail: req.session.userEmail,
                                sessionType: req.session.computerType,
                                lastLogin: user ? user.last_login : null,
                                clientIP: req.ip,
                                csrfToken: req.csrfToken()
                            });
                        });
                    });
                });
            });
        });
    });
});

// Compose message page
router.get('/compose', requireAuth, (req, res) => {
    const db = new Database().getDB();
    
    // Get list of users to send messages to
    db.all('SELECT id, email FROM users WHERE is_active = 1 AND id != ?', [req.session.userId], (err, users) => {
        if (err) {
            console.error('Error fetching users:', err);
            users = [];
        }
        
        res.render('compose', {
            users,
            error: '',
            message: '',
            csrfToken: req.csrfToken()
        });
    });
});

// Send message
router.post('/compose', 
    requireAuth,
    [
        body('recipient_id')
            .isInt({ min: 1 })
            .withMessage('Please select a valid recipient'),
        body('subject')
            .trim()
            .isLength({ min: 1, max: 200 })
            .withMessage('Subject must be between 1 and 200 characters'),
        body('body')
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage('Message body must be between 1 and 5000 characters')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const db = new Database().getDB();
            db.all('SELECT id, email FROM users WHERE is_active = 1 AND id != ?', [req.session.userId], (err, users) => {
                res.render('compose', {
                    users: users || [],
                    error: errors.array()[0].msg,
                    message: '',
                    csrfToken: req.csrfToken()
                });
            });
            return;
        }

        const { recipient_id, subject, body } = req.body;
        const db = new Database().getDB();
        
        // Sanitize the message body to prevent XSS
        const sanitizedBody = sanitizeHtml(body, {
            allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
            allowedAttributes: {}
        });

        // Verify recipient exists and is active
        db.get('SELECT id, email FROM users WHERE id = ? AND is_active = 1', [recipient_id], (err, recipient) => {
            if (err || !recipient) {
                const db = new Database().getDB();
                db.all('SELECT id, email FROM users WHERE is_active = 1 AND id != ?', [req.session.userId], (err, users) => {
                    res.render('compose', {
                        users: users || [],
                        error: 'Invalid recipient selected',
                        message: '',
                        csrfToken: req.csrfToken()
                    });
                });
                return;
            }

            // Insert the message
            db.run(
                'INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?)',
                [req.session.userId, recipient_id, subject, sanitizedBody],
                function(err) {
                    if (err) {
                        console.error('Error sending message:', err);
                        const db = new Database().getDB();
                        db.all('SELECT id, email FROM users WHERE is_active = 1 AND id != ?', [req.session.userId], (err, users) => {
                            res.render('compose', {
                                users: users || [],
                                error: 'Failed to send message. Please try again.',
                                message: '',
                                csrfToken: req.csrfToken()
                            });
                        });
                        return;
                    }

                    securityLogger('MESSAGE_SENT', req, {
                        messageId: this.lastID,
                        recipientId: recipient_id,
                        recipientEmail: recipient.email
                    });

                    res.redirect('/dashboard?message=Message sent successfully!');
                }
            );
        });
    }
);

// View specific message
router.get('/message/:id', requireAuth, (req, res) => {
    const messageId = req.params.id;
    const userId = req.session.userId;
    const db = new Database().getDB();

    // Get message details - user can only view messages they sent or received
    db.get(`
        SELECT m.*, 
               sender.email as sender_email, 
               recipient.email as recipient_email
        FROM messages m
        JOIN users sender ON m.sender_id = sender.id
        JOIN users recipient ON m.recipient_id = recipient.id
        WHERE m.id = ? AND (m.sender_id = ? OR m.recipient_id = ?)
    `, [messageId, userId, userId], (err, message) => {
        if (err || !message) {
            securityLogger('MESSAGE_ACCESS_DENIED', req, { messageId, userId });
            return res.redirect('/dashboard?error=Message not found or access denied');
        }

        // Mark message as read if user is the recipient
        if (message.recipient_id === userId && !message.read_at) {
            db.run('UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE id = ?', [messageId], (err) => {
                if (!err) {
                    securityLogger('MESSAGE_READ', req, { messageId });
                }
            });
        }

        res.render('message', {
            message,
            currentUserId: userId,
            csrfToken: req.csrfToken()
        });
    });
});

// Message inbox
router.get('/inbox', requireAuth, (req, res) => {
    const userId = req.session.userId;
    const db = new Database().getDB();
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    // Get messages for current user
    db.all(`
        SELECT m.*, u.email as sender_email 
        FROM messages m 
        JOIN users u ON m.sender_id = u.id 
        WHERE m.recipient_id = ? 
        ORDER BY m.created_at DESC 
        LIMIT ? OFFSET ?
    `, [userId, limit, offset], (err, messages) => {
        if (err) {
            console.error('Error fetching inbox:', err);
            messages = [];
        }

        // Get total count for pagination
        db.get('SELECT COUNT(*) as count FROM messages WHERE recipient_id = ?', [userId], (err, result) => {
            const totalMessages = result ? result.count : 0;
            const totalPages = Math.ceil(totalMessages / limit);

            res.render('inbox', {
                messages,
                currentPage: page,
                totalPages,
                totalMessages,
                csrfToken: req.csrfToken()
            });
        });
    });
});

// Sent messages
router.get('/sent', requireAuth, (req, res) => {
    const userId = req.session.userId;
    const db = new Database().getDB();
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    // Get sent messages
    db.all(`
        SELECT m.*, u.email as recipient_email 
        FROM messages m 
        JOIN users u ON m.recipient_id = u.id 
        WHERE m.sender_id = ? 
        ORDER BY m.created_at DESC 
        LIMIT ? OFFSET ?
    `, [userId, limit, offset], (err, messages) => {
        if (err) {
            console.error('Error fetching sent messages:', err);
            messages = [];
        }

        // Get total count for pagination
        db.get('SELECT COUNT(*) as count FROM messages WHERE sender_id = ?', [userId], (err, result) => {
            const totalMessages = result ? result.count : 0;
            const totalPages = Math.ceil(totalMessages / limit);

            res.render('sent', {
                messages,
                currentPage: page,
                totalPages,
                totalMessages,
                csrfToken: req.csrfToken()
            });
        });
    });
});

module.exports = router;