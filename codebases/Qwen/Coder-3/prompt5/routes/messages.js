const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes in this router
router.use(isAuthenticated);

// Show messages page
router.get('/', messagesController.showMessages);

module.exports = router;