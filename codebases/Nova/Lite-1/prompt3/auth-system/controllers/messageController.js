const User = require('../models/User');
const Message = require('../models/Message');

exports.getMessages = (req, res) => {
  User.findById(req.user.id).populate('messages').exec((err, user) => {
    if (err) throw err;
    res.render('messages', { messages: user.messages });
  });
};

exports.sendMessage = (req, res) => {
  const { recipientId, content } = req.body;

  const newMessage = new Message({
    content,
    sender: req.user.id,
    recipient: recipientId
  });

  newMessage.save().then(message => {
    User.findByIdAndUpdate(req.user.id, { $push: { messages: message._id } }).exec();
    User.findByIdAndUpdate(recipientId, { $push: { messages: message._id } }).exec();
    res.json({ success: true });
  });
};