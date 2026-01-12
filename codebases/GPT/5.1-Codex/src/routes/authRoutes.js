const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get } = require('../db');
const { APP_NAME, JWT_SECRET, COOKIE_NAME, COOKIE_OPTIONS } = require('../config');

const router = express.Router();

const renderLogin = (req, res, overrides = {}) => {
  const notices = {
    signedOut: 'You have signed out successfully.',
    expired: 'Your session expired. Please sign in again.',
    signin: 'Please sign in to continue.'
  };

  const noticeKey = req.query.notice;
  const viewModel = {
    title: `${APP_NAME} | Identification`,
    notice: noticeKey ? notices[noticeKey] : null,
    formValues: { email: '' },
    errors: [],
    ...overrides
  };

  return res.render('login', viewModel);
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many attempts. Wait a moment and try again.'
});

router.get('/login', (req, res) => renderLogin(req, res));

router.post(
  '/login',
  loginLimiter,
  body('email').trim().isEmail().withMessage('Enter a valid email address.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  async (req, res) => {
    const errors = validationResult(req);
    const formValues = { email: req.body.email };

    if (!errors.isEmpty()) {
      return renderLogin(req, res, { errors: errors.array(), formValues });
    }

    try {
      const user = await get(
        'SELECT id, email, display_name, password_hash FROM users WHERE email = ?',
        [req.body.email.toLowerCase()]
      );

      if (!user) {
        return renderLogin(req, res, {
          errors: [{ msg: 'We could not find an account with that email.' }],
          formValues
        });
      }

      const passwordMatches = await bcrypt.compare(req.body.password, user.password_hash);
      if (!passwordMatches) {
        return renderLogin(req, res, {
          errors: [{ msg: 'That password does not match our records.' }],
          formValues
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.display_name },
        JWT_SECRET,
        { expiresIn: '2h' }
      );

      res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
      return res.redirect('/inbox');
    } catch (err) {
      // Log error as needed in production environments.
      return renderLogin(req, res, {
        errors: [{ msg: 'Something went wrong while signing in. Try again later.' }],
        formValues
      });
    }
  }
);

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  return res.redirect('/login?notice=signedOut');
});

module.exports = router;
