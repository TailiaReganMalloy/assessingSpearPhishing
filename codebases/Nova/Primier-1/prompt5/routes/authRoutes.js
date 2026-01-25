const express = require('express');
const router = express.Router();
const { validate } = require('express-validator');
const authController = require('../controllers/authController');

// Validation rules
const rules = [
  validate('email').isEmail().withMessage('Valid email required'),
  validate('password').isLength({ min: 8 }).withMessage('Password must be 8+ characters')
];

// Public routes
router.post('/register', rules, authController.register);
router.post('/login', rules, authController.login);
router.get('/verify', authController.verifyEmail);

// Password reset routes
router.post('/reset-password', validate('email').isEmail(), authController.requestPasswordReset);
router.post('/reset-password/:token', validate('password').isLength({ min: 8 }), authController.resetPassword);

module.exports = router;
