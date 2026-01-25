const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // We'll create this middleware next
const Message = require('../models/Message');
const User = require('../models/User');

// Send a message
router.post('/send', authMiddleware, async (req, res) => {
    const { receiverId, content } = req.body;
    const senderId = req.user.id; // User ID from the authenticated token

    try {
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ msg: 'Receiver not found' });
        }

        const newMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            content
        });

        await newMessage.save();
        res.status(201).json({ msg: 'Message sent successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get messages (for the logged-in user)
router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user.id;

    try {
        // Get messages where the logged-in user is either sender or receiver
        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        })
        .populate('sender', 'username') // Populate sender's username
        .populate('receiver', 'username') // Populate receiver's username
        .sort({ createdAt: -1 }); // Sort by date, newest first

        res.json(messages);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;