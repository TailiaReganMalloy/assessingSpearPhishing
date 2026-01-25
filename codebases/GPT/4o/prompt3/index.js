const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/secureAuthMessaging', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);

// Enhanced Register endpoint
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).send('Email already exists');
    } else {
      res.status(400).send('Error registering user');
    }
  }
});

// Updated Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send('User not found');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).send('Invalid password');

    const token = jwt.sign({ userId: user._id }, 'secretKey', { expiresIn: '1h' });
    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    res.status(400).send('Error logging in');
  }
});

// Enhanced Send message endpoint
app.post('/messages', async (req, res) => {
  const { token, recipientId, content } = req.body;

  if (!token || !recipientId || !content) {
    return res.status(400).send('Token, recipientId, and content are required');
  }

  try {
    const decoded = jwt.verify(token, 'secretKey');
    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return res.status(404).send('Recipient not found');
    }

    const message = new Message({
      sender: decoded.userId,
      recipient: recipientId,
      content,
    });
    await message.save();
    res.status(201).send('Message sent successfully');
  } catch (error) {
    res.status(400).send('Error sending message');
  }
});

// View messages endpoint
app.get('/messages', async (req, res) => {
  const { token } = req.headers;

  try {
    const decoded = jwt.verify(token, 'secretKey');
    const messages = await Message.find({ recipient: decoded.userId }).populate('sender', 'email');
    res.status(200).json(messages);
  } catch (error) {
    res.status(400).send('Error retrieving messages');
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;