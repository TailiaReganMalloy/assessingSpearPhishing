const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authenticateToken = require('../middleware/auth');
const User = require('../models/User'); // To get user IDs from emails

// Send a message
router.post('/send', authenticateToken, async (req, res) => {
  const { to, content } = req.body;
  const senderId = req.user.id; // User ID from the authenticated token

  if (!to || !content) {
    return res.status(400).json({ message: 'Recipient and content are required' });
  }

  try {
    // Find the receiver's ID by their email
    const receiverUser = await User.findUserByEmail(to);
    if (!receiverUser) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }
    const receiverId = receiverUser.id;

    const newMessage = await Message.sendMessage(senderId, receiverId, content);
    res.status(201).json({ message: 'Message sent successfully', message: newMessage });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Server error sending message' });
  }
});

// Get messages for the logged-in user
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const messages = await Message.getMessages(userId);
    res.json(messages);
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: 'Server error retrieving messages' });
  }
});

module.exports = router;
