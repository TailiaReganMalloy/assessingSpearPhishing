const Message = require('../models/Message');
const User = require('../models/User');

// Send a message
exports.sendMessage = async (req, res) => {
  const { recipientEmail, subject, body } = req.body;

  try {
    // Find recipient
    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      return res.status(400).json({ msg: 'Recipient not found' });
    }

    // Create message
    const message = new Message({
      sender: req.session.userId,
      recipient: recipient._id,
      subject,
      body,
    });
    await message.save();

    res.redirect('/inbox');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get inbox messages
exports.getInbox = async (req, res) => {
  try {
    const messages = await Message.find({ recipient: req.session.userId })
      .populate('sender', 'email')
      .sort({ createdAt: -1 });
    
    res.render('inbox', { messages });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get sent messages
exports.getSentMessages = async (req, res) => {
  try {
    const messages = await Message.find({ sender: req.session.userId })
      .populate('recipient', 'email')
      .sort({ createdAt: -1 });
    
    res.render('sent', { messages });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};