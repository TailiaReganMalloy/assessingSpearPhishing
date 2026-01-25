const Message = require('../models/message');
const User = require('../models/user');
const User = require('../models/user');

exports.sendMessage = (req, res) => {
    const { sender, recipient, content } = req.body;

    const newMessage = new Message({ sender, recipient, content });

    newMessage.save((err) => {
        if (err) throw err;
        res.redirect('/messages/inbox');
    });
};

exports.getMessages = async (req, res) => {
    const user = req.user;

    const messages = await Message.find({ recipient: user.id });
    res.render('inbox', { messages });
};