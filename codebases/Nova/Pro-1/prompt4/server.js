const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const messagesRoutes = require('./routes/messages');

app.use('/auth', authRoutes);
app.use('/messages', messagesRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});