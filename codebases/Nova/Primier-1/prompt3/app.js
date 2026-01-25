const express = require('express');
const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

module.exports = app;