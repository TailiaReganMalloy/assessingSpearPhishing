const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Database connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Passport configuration
passport.use(new LocalStrategy({
  usernameField: 'email'
}, (email, password, done) => {
  // Find user by email
  // Verify password
  // Return user or error
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  // Find user by id
  // Return user or error
});

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

// Import authentication routes
const authRoutes = require('./routes/auth');

// Use authentication routes
app.use('/auth', authRoutes);

// Import message viewing routes
const messagesRoutes = require('./routes/messages');

// Use message viewing routes
app.use('/messages', messagesRoutes);

// Routes
app.get('/', (req, res) => res.send('Welcome to the secure messaging app'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));