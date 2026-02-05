/**
 * Messaging Routes
 * 
 * Handles sending and retrieving messages between users.
 * Demonstrates secure message storage and retrieval.
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');

// Path to messages data file
const MESSAGES_FILE = path.join(__dirname, '../data/messages.json');

/**
 * Helper function to read messages from file
 */
function readMessages() {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading messages file:', err);
  }
  return [];
}

/**
 * Helper function to write messages to file
 */
function writeMessages(messages) {
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
  } catch (err) {
    console.error('Error writing messages file:', err);
  }
}

/**
 * GET /api/messages/inbox
 * Retrieve all messages for the authenticated user
 */
router.get('/inbox', authMiddleware, (req, res) => {
  try {
    const messages = readMessages();
    
    // Filter messages for the current user
    const userMessages = messages.filter(msg => msg.recipientId === req.session.userId);
    
    // Sort by date (newest first)
    userMessages.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

    res.json(userMessages);
  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

/**
 * POST /api/messages/send
 * Send a message to another user
 */
router.post('/send', authMiddleware, (req, res) => {
  try {
    const { recipientLogin, messageContent } = req.body;

    // Validate input
    if (!recipientLogin || !messageContent) {
      return res.status(400).json({ error: 'Recipient and message content are required' });
    }

    // Prevent sending message to self
    if (recipientLogin === req.session.username) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    const messages = readMessages();
    const usersFile = path.join(__dirname, '../data/users.json');
    let users = [];

    // Read users to find recipient ID
    try {
      if (fs.existsSync(usersFile)) {
        const data = fs.readFileSync(usersFile, 'utf8');
        users = JSON.parse(data);
      }
    } catch (err) {
      console.error('Error reading users:', err);
    }

    const recipient = users.find(u => u.login === recipientLogin);

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient user not found' });
    }

    // Create new message
    const newMessage = {
      id: Date.now().toString(),
      senderId: req.session.userId,
      senderLogin: req.session.username,
      recipientId: recipient.id,
      recipientLogin: recipient.login,
      content: messageContent,
      sentAt: new Date().toISOString(),
      read: false
    };

    // Add message and save
    messages.push(newMessage);
    writeMessages(messages);

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * PUT /api/messages/mark-read/:messageId
 * Mark a message as read
 */
router.put('/mark-read/:messageId', authMiddleware, (req, res) => {
  try {
    const { messageId } = req.params;
    const messages = readMessages();

    const message = messages.find(m => m.id === messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Verify user owns this message
    if (message.recipientId !== req.session.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    message.read = true;
    writeMessages(messages);

    res.json({ success: true, message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

module.exports = router;
