const { Router } = require('express');
const { body } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const messageController = require('../controllers/messageController');

const router = Router();

router.post(
  '/',
  requireAuth,
  [
    body('recipientId').isInt({ min: 1 }).withMessage('Choose a valid recipient.'),
    body('subject')
      .trim()
      .isLength({ min: 1, max: 120 })
      .withMessage('Subject is required (max 120 characters).'),
    body('body')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Message body is required (max 2000 characters).'),
  ],
  messageController.handleSendMessage
);

module.exports = router;
