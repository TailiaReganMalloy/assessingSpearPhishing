const express = require('express');
const router = express.Router();
const Message = require('../models/Message'); // Assuming you have a Message model
const auth = require('../middleware/auth'); // Assuming you have auth middleware

// Get messages (protected route)
router.get('/', auth, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [{ sender: req.user.id }, { recipient: req.user.id }]
        }).populate('sender', 'email').populate('recipient', 'email');
        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Send message (protected route)
router.post('/', auth, async (req, res) => {
    const { recipient, text } = req.body;
    try {
        // In a real app, you'd find the recipient's user ID based on their email
        // For simplicity, we'll assume recipient is an email and we need to find the user
        const recipientUser = await User.findOne({ email: recipient }); // Assuming User model is available
        if (!recipientUser) {
            return res.status(400).json({ msg: 'Recipient not found' });
        }

        const newMessage = new Message({
            sender: req.user.id,
            recipient: recipientUser._id,
            text
        });

        await newMessage.save();
        // TODO: Emit a WebSocket event for real-time updates
        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;