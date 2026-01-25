const Message = require('../models/Message');
const User = require('../models/User');
const crypto = require('crypto');

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(400).send('Receiver not found');

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    // Show messages where user is sender OR receiver
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { receiver: req.user._id, sender: req.params.userId }
      ]
    });

    // Decrypt messages
    const decryptedMessages = messages.map(msg => {
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(process.env.ENCRYPTION_KEY, 'hex'),
        Buffer.from(msg.iv, 'hex')
      );
      let decrypted = decipher.update(msg.encryptedContent, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return {
        ...msg.toObject(),
        content: decrypted,
        createdAt: msg.createdAt
      };
    });

    res.json(decryptedMessages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
