const Message = require('../models/Message');

const sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const message = new Message({
      sender: req.user.id,
      recipient: recipientId,
      content,
    });
    await message.save();
    res.status(201).send('Message sent successfully');
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ recipient: req.user.id }).populate('sender', 'email');
    res.json(messages);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = { sendMessage, getMessages };