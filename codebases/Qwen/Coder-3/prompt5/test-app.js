// Simple test to verify the application works
const express = require('express');
const app = express();
const PORT = 3001;

app.get('/', (req, res) => {
  res.send('BlueMind v5 Test Server');
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});