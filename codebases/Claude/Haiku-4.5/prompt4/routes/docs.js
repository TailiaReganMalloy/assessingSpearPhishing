const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  res.json({
    app: 'Secure Messaging Application',
    version: '1.0.0',
    description: 'Educational platform for learning secure authentication and messaging',
    endpoints: {
      auth: [
        'POST /auth/register - Register new user',
        'POST /auth/login - Login user',
        'GET /auth/logout - Logout user',
        'GET /auth/me - Get current user info'
      ],
      messages: [
        'GET /api/messages - Get inbox',
        'GET /api/messages/sent - Get sent messages',
        'GET /api/messages/:id - Get message detail',
        'POST /api/messages - Send message',
        'DELETE /api/messages/:id - Delete message'
      ],
      users: [
        'GET /api/users - List all users',
        'GET /api/users/profile/:id - Get user profile'
      ]
    },
    security: {
      passwordHashing: 'bcryptjs (10 rounds)',
      authentication: 'JWT tokens',
      sessionStorage: 'SQLite database',
      httpOnly: 'Secure cookies',
      sameSite: 'Strict CSRF protection'
    }
  });
});

module.exports = router;
