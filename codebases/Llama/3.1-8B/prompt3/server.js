// Import the express module
const express = require('express');

// Create an instance of the express app
const app = express();

// Define a route for the login page
app.get('/login', (req, res) => {
    // Render the login page
    res.sendFile(__dirname + '/login.ejs');
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});