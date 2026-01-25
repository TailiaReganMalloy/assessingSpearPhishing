const Message = require('../models/Message');
const User = require('../models/User');

exports.sendMessage = async (req, res) => {
  const { sender, recipient, content } = req.body;
  const message = new Message({ sender, recipient, content });
  await message.save();
  res.json({ msg: 'Message sent' });
};

exports.getInbox = async (req, res) => {
  const messages = await Message.find({ recipient: req.params.userId }).populate('sender');
  res.json(messages);
};