// Configuration file for BlueMind v5
module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },

  // Database configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/bluemind'
  },

  // Security configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-here',
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret-here',
    saltRounds: 12
  },

  // Application settings
  app: {
    name: 'BlueMind v5',
    version: '1.0.0'
  }
};