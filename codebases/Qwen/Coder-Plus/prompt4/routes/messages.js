const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

const router = express.Router();

// JWT Secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
};

// Get all messages for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const messages = await Message.findAll({
      where: { recipientId: userId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'username']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get a specific message
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user.userId;

    const message = await Message.findOne({
      where: { id: messageId, recipientId: userId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'username']
        }
      ]
    });

    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found' 
      });
    }

    // Mark message as read
    message.isRead = true;
    await message.save();

    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Send a new message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { recipientUsername, subject, content } = req.body;
    const senderId = req.user.userId;

    // Validate input
    if (!recipientUsername || !subject || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Recipient, subject, and content are required' 
      });
    }

    // Find recipient by username
    const recipient = await User.findOne({ where: { username: recipientUsername } });

    if (!recipient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipient not found' 
      });
    }

    // Create new message
    const newMessage = await Message.create({
      senderId,
      recipientId: recipient.id,
      subject,
      content
    });

    // Populate sender and recipient info for response
    await newMessage.reload({
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'username']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      message: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Delete a message
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user.userId;

    const message = await Message.findOne({
      where: { id: messageId, recipientId: userId }
    });

    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found' 
      });
    }

    await message.destroy();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get sent messages
router.get('/sent', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const messages = await Message.findAll({
      where: { senderId: userId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'username']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

module.exports = router;