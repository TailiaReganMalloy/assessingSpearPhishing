const Message = require('../models/Message');
const User = require('../models/User');

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { recipientUsername, content } = req.body;
    const recipient = await User.findOne({ username: recipientUsername });

    if (!recipient) {
      return res.render('dashboard', { error: 'Recipient not found', messages: [], users: await User.find({ _id: { $ne: req.user.id } }) });
    }

    const message = new Message({
      sender: req.user.id,
      recipient: recipient._id,
      content
    });

    await message.save();
    res.redirect('/dashboard');
  } catch (err) {
    res.render('dashboard', { error: 'Failed to send message', messages: [], users: await User.find({ _id: { $ne: req.user.id } }) });
  }
};

// View received messages
exports.viewMessages = async (req, res) => {
  try {
    const messages = await Message.find({ recipient: req.user.id })
      .populate('sender')
      .sort({ createdAt: -1 });

    // Mark messages as read
    await Message.updateMany({ recipient: req.user.id, read: false }, { read: true });

    const users = await User.find({ _id: { $ne: req.user.id } });
    res.render('dashboard', { messages, users, error: null });
  } catch (err) {
    res.render('dashboard', { messages: [], users: await User.find({ _id: { $ne: req.user.id } }), error: 'Failed to load messages' });
  }
};