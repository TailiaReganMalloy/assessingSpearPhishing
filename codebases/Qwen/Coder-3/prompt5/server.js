const { app, PORT } = require('./app');

app.listen(PORT, () => {
  console.log(`BlueMind v5 server running on port ${PORT}`);
});