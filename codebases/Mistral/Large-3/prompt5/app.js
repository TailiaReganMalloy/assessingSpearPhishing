const express = require('express');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
require('dotenv').config();

const app = express();

// Database Connection
connectDB();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// View Engine
app.set('view engine', 'ejs');

// Routes
app.use('/', authRoutes);
app.use('/messages', messageRoutes);

// Dashboard Route
app.get('/dashboard', (req, res) => {
  res.render('dashboard', { user: req.user });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});