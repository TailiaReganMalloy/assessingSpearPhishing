const express = require('express');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const { authenticateToken } = require('../utils/auth');

// Send a new message
router.post('/send', authenticateToken, [
  body('recipientId')
    .isMongoId()
    .withMessage('Recipient ID must be a valid MongoDB ObjectId'),
  body('subject')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Subject is required and must be less than 100 characters'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content is required and must be less than 10,000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recipientId, subject, content } = req.body;
    
    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Create new message
    const message = new Message({
      sender: req.user.userId,
      recipient: recipientId,
      subject,
      content
    });

    await message.save();

    res.status(201).json({
      message: 'Message sent successfully',
      messageId: message._id
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages received by the authenticated user
router.get('/received', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get messages received by the user
    const messages = await Message.find({ recipient: req.user.userId })
      .populate('sender', 'username email')
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit);

    // Count total messages for pagination
    const totalMessages = await Message.countDocuments({ recipient: req.user.userId });

    res.json({
      messages,
      totalPages: Math.ceil(totalMessages / limit),
      currentPage: page,
      totalMessages
    });
  } catch (error) {
    console.error('Error fetching received messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages sent by the authenticated user
router.get('/sent', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get messages sent by the user
    const messages = await Message.find({ sender: req.user.userId })
      .populate('recipient', 'username email')
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit);

    // Count total messages for pagination
    const totalMessages = await Message.countDocuments({ sender: req.user.userId });

    res.json({
      messages,
      totalPages: Math.ceil(totalMessages / limit),
      currentPage: page,
      totalMessages
    });
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark a message as read
router.patch('/read/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify the message exists and belongs to the recipient
    const message = await Message.findOneAndUpdate(
      { _id: id, recipient: req.user.userId },
      { read: true, updatedAt: new Date() },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found or unauthorized' });
    }

    res.json({
      message: 'Message marked as read',
      messageId: message._id
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a message
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify the message exists and belongs to the user (either sender or recipient)
    const message = await Message.findOneAndDelete({
      _id: id,
      $or: [
        { sender: req.user.userId },
        { recipient: req.user.userId }
      ]
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found or unauthorized' });
    }

    res.json({
      message: 'Message deleted successfully',
      messageId: message._id
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;