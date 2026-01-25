const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const message = new Message({
      sender: req.session.userId,
      content,
    });
    await message.save();
    req.flash('success', 'Message sent successfully.');
    res.redirect('/dashboard');
  } catch (err) {
    req.flash('error', 'Failed to send message.');
    res.redirect('/dashboard');
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).populate('sender', 'email');
    res.render('dashboard', { messages, messages: req.flash() });
  } catch (err) {
    req.flash('error', 'Failed to load messages.');
    res.redirect('/dashboard');
  }
};