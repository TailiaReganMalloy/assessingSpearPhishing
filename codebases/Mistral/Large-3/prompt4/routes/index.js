"use strict";

const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const User = require('../models/User');
const Message = require('../models/Message');
const { generateToken, doubleCsrfProtection } = require('../middleware/csrf');

// Dashboard
router.get('/dashboard', ensureAuthenticated, doubleCsrfProtection, (req, res) => {
    const csrfToken = generateToken(res, req);
    
    User.findById(req.session.userId, (err, user) => {
        if (err) {
            console.error('Dashboard error:', err);
            req.flash('error_msg', 'An error occurred while loading the dashboard');
            return res.redirect('/login');
        }
        
        Message.getForUser(req.session.userId, (err, messages) => {
            if (err) {
                console.error('Dashboard error:', err);
                req.flash('error_msg', 'An error occurred while loading the dashboard');
                return res.redirect('/login');
            }
            
            res.render('dashboard', {
                title: 'Dashboard',
                user,
                messages,
                csrfToken
            });
        });
    });
});

// Send message page
router.get('/send-message', ensureAuthenticated, doubleCsrfProtection, (req, res) => {
    const csrfToken = generateToken(res, req);
    
    User.findById(req.session.userId, (err, user) => {
        if (err) {
            console.error('Send message page error:', err);
            req.flash('error_msg', 'An error occurred while loading the send message page');
            return res.redirect('/dashboard');
        }
        
        Message.getAllUsersExcept(req.session.userId, (err, users) => {
            if (err) {
                console.error('Send message page error:', err);
                req.flash('error_msg', 'An error occurred while loading the send message page');
                return res.redirect('/dashboard');
            }
            
            res.render('send_message', {
                title: 'Send Message',
                user,
                users,
                csrfToken
            });
        });
    });
});

// Send message form submission
router.post('/send-message', ensureAuthenticated, doubleCsrfProtection, (req, res) => {
    const { receiver_id, content } = req.body;
    
    if (!receiver_id || !content) {
        req.flash('error_msg', 'Please fill in all fields');
        return res.redirect('/send-message');
    }
    
    if (content.length > 1000) {
        req.flash('error_msg', 'Message is too long (max 1000 characters)');
        return res.redirect('/send-message');
    }
    
    // Create message
    Message.create(req.session.userId, receiver_id, content, (err) => {
        if (err) {
            console.error('Send message error:', err);
            req.flash('error_msg', 'An error occurred while sending the message');
            return res.redirect('/send-message');
        }
        
        req.flash('success_msg', 'Message sent successfully');
        res.redirect('/dashboard');
    });
});

// Home route
router.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

module.exports = router;