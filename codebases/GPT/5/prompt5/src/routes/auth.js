const express = require('express');

module.exports = function(loginLimiter, getUserByEmail, verifyUserPassword) {
  const router = express.Router();

  router.get('/login', (req, res) => {
    if (req.session.userId) return res.redirect('/messages');
    res.render('login', { title: 'Identification' });
  });

  router.post('/login', loginLimiter, (req, res) => {
    const { email = '', password = '' } = req.body;
    const sanitizedEmail = String(email).trim().toLowerCase();

    const user = verifyUserPassword(sanitizedEmail, String(password));
    if (!user) {
      req.session.flash = { type: 'error', message: 'Invalid email or password.' };
      return res.redirect('/login');
    }

    req.session.userId = user.id;
    req.session.userEmail = user.email;
    res.redirect('/messages');
  });

  router.post('/logout', (req, res) => {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  });

  return router;
};
