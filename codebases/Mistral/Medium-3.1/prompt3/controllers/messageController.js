const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const message = new Message({
      sender: req.session.userId,
      recipient: recipientId,
      content
    });
    await message.save();
    res.redirect('/messages');
  } catch (err) {
    res.status(500).render('messages', { error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.session.userId },
        { recipient: req.session.userId }
      ]
    }).populate('sender recipient', 'username');
    res.render('messages', { messages });
  } catch (err) {
    res.status(500).render('messages', { error: err.message });
  }
};