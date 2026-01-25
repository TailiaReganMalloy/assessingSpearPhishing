const { Router } = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { ensureGuest, requireAuth } = require('../middleware/auth');

const router = Router();

const emailValidation = body('email')
  .trim()
  .isEmail()
  .withMessage('Enter a valid email address.');

const passwordValidation = body('password')
  .isLength({ min: 10 })
  .withMessage('Password must be at least 10 characters long.')
  .matches(/[A-Z]/)
  .withMessage('Password must include an uppercase letter.')
  .matches(/[a-z]/)
  .withMessage('Password must include a lowercase letter.')
  .matches(/[0-9]/)
  .withMessage('Password must include a number.')
  .matches(/[^A-Za-z0-9]/)
  .withMessage('Password must include a symbol.');

router.get('/login', ensureGuest, authController.renderLogin);
router.post('/login', ensureGuest, [emailValidation, passwordValidation], authController.handleLogin);

router.get('/register', ensureGuest, authController.renderRegister);
router.post(
  '/register',
  ensureGuest,
  [
    body('displayName').trim().isLength({ min: 2 }).withMessage('Display name must be at least two characters.'),
    emailValidation,
    passwordValidation,
    body('confirmPassword').notEmpty().withMessage('Confirm your password.'),
  ],
  authController.handleRegister
);

router.post('/logout', requireAuth, authController.handleLogout);

module.exports = router;
