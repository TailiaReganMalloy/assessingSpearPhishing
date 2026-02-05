// Import required modules
const express = require('express');
const app = require('./login');

// Create an Express app
const server = app.listen(3000, () => {
  console.log('Server started on port 3000');
});

// Export the server
module.exports = server;