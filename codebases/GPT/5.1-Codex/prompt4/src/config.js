const path = require('path');
require('dotenv').config();

const env = (key, defaultValue) => {
  const value = process.env[key];
  return value === undefined || value === '' ? defaultValue : value;
};

module.exports = {
  port: Number(env('PORT', 3000)),
  sessionSecret: env('SESSION_SECRET', 'change-me-in-production'),
  isProduction: env('NODE_ENV', 'development') === 'production',
  databaseFile: path.join(__dirname, '..', 'data', 'app.db')
};
