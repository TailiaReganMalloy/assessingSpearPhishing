const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./utils/db'); // Assuming you'll create this for DB connection

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your_jwt_secret_key'; // Replace with a strong secret key

// Middleware
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/messages', require('./routes/messages'));

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to the Authentication and Messaging App!');
});

// Start server
db.connect() // Assuming db.connect() initializes the connection pool
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
