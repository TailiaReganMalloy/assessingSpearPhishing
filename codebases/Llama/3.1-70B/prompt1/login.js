// Import required modules
const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost/blueMindDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Define the User model
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model('User', userSchema);

// Create an Express app
const app = express();

// Define routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// Export the app
module.exports = app;