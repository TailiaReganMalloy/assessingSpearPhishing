const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/sample-project', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.status(201).send('User registered successfully');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).send('Invalid username or password');
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return res.status(401).send('Invalid username or password');
  const token = jwt.sign({ userId: user._id }, 'secretkey');
  res.status(200).json({ token });
});

const messageSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

app.post('/send-message', async (req, res) => {
  const { sender, receiver, message } = req.body;
  const newMessage = new Message({ sender, receiver, message });
  await newMessage.save();
  res.status(201).send('Message sent successfully');
});

app.get('/messages/:receiver', async (req, res) => {
  const { receiver } = req.params;
  const messages = await Message.find({ receiver });
  res.status(200).json(messages);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});