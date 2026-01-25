const Message = require('../models/Message');
const User = require('../models/User');

exports.getDashboard = async (req, res) => {
    try {
        const messages = await Message.find({ receiver: req.user.id }).populate('sender').sort({ timestamp: -1 });
        const users = await User.find({ _id: { $ne: req.user.id } });
        res.render('dashboard', { 
            title: 'BlueMind v5 - Dashboard', 
            messages, 
            users, 
            currentUser: req.user 
        });
    } catch (err) {
        res.render('dashboard', { error: 'Server error', title: 'BlueMind v5 - Dashboard', messages: [], users: [], currentUser: req.user });
    }
};

exports.postMessage = async (req, res) => {
    const { receiver, content } = req.body;
    try {
        const message = new Message({
            sender: req.user.id,
            receiver,
            content
        });
        await message.save();
        res.redirect('/dashboard');
    } catch (err) {
        res.redirect('/dashboard');
    }
};