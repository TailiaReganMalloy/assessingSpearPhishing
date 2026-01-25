const express = require('express');
const mongoose = require('mongoose');

const app = express();

mongoose.connect('mongodb://localhost:27017/secure-messaging-app', { useNewUrlParser: true, useUnifiedTopology: true });

const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');

app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});