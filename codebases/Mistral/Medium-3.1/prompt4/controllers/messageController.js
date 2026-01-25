const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const message = new Message({
      sender: req.user.userId,
      recipient: recipientId,
      content,
    });
    await message.save();
    res.status(201).send('Message sent.');
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.userId },
        { recipient: req.user.userId },
      ],
    }).populate('sender recipient', 'email');
    res.json(messages);
  } catch (error) {
    res.status(400).send(error.message);
  }
};