const Message = require('../models/Message');
const User = require('../models/User');

exports.sendMessage = async (req, res) => {
  const { receiverId, content } = req.body;
  try {
    const sender = req.user.id;
    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ msg: 'User not found' });

    const message = new Message({ sender, receiver, content });
    await message.save();

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ receiver: req.user.id })
      .populate('sender', 'email')
      .sort({ timestamp: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};