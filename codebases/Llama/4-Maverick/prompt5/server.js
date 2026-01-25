const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mailer');

// Define user schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
const User = mongoose.model('User', userSchema);

// Define message schema
const messageSchema = new mongoose.Schema({
  content: String,
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
const Message = mongoose.model('Message', messageSchema);

// Register user
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.send('User registered successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Login user
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send('User not found');
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).send('Invalid password');
    const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '1h' });
    res.send(token);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Send message
app.post('/send-message', authenticateToken, async (req, res) => {
  try {
    const { content, recipientId } = req.body;
    const message = new Message({ content, sender: req.user.userId, recipient: recipientId });
    await message.save();
    res.send('Message sent successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Get messages
app.get('/get-messages', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find({ recipient: req.user.userId }).populate('sender', 'email');
    res.json(messages);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Authenticate token middleware
function authenticateToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send('Access denied');
  jwt.verify(token, 'secretkey', (error, user) => {
    if (error) return res.status(403).send('Invalid token');
    req.user = user;
    next();
  });
}

const PORT = 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));