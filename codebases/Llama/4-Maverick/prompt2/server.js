const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/auth-demo', { useNewUrlParser: true, useUnifiedTopology: true });

// Define user schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

// Define message schema
const messageSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  message: String
});

const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);

// Register user
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.send('User registered successfully');
});

// Login user
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).send('Invalid username or password');
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) return res.status(401).send('Invalid username or password');
  const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '1h' });
  res.send(token);
});

// Send message
app.post('/send-message', async (req, res) => {
  const { sender, receiver, message } = req.body;
  const newMessage = new Message({ sender, receiver, message });
  await newMessage.save();
  res.send('Message sent successfully');
});

// Get messages
app.get('/get-messages/:username', async (req, res) => {
  const { username } = req.params;
  const messages = await Message.find({ receiver: username });
  res.send(messages);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});