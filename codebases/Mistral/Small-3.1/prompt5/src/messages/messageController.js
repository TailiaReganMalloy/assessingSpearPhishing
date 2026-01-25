const Message = require('../models/Message');

// Get all messages
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new message
exports.createMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const message = new Message({
      sender: req.user.id,
      content,
    });

    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};