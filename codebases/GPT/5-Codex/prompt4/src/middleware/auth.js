const userModel = require('../models/userModel');

function attachUser(req, _res, next) {
  if (!req.session.userId) {
    req.user = null;
    return next();
  }

  const user = userModel.findById(req.session.userId);

  if (!user) {
    delete req.session.userId;
    req.user = null;
    return next();
  }

  req.user = user;
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    req.session.flash = { type: 'error', message: 'Please log in to continue.' };
    return res.redirect('/login');
  }
  next();
}

function ensureGuest(req, res, next) {
  if (req.user) {
    return res.redirect('/dashboard');
  }
  next();
}

module.exports = {
  attachUser,
  requireAuth,
  ensureGuest,
};
