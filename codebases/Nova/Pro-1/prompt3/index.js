const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');

const app = express();

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/prompt3', { useNewUrlParser: true, useUnifiedTopology: true });

app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('login');
});

app.get('/inbox/:userId', async (req, res) => {
  const User = require('./models/User');
  const Message = require('./models/Message');
  const messages = await Message.find({ recipient: req.params.userId }).populate('sender');
  res.render('inbox', { messages });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});