const jwt = require('jsonwebtoken');
const { COOKIE_NAME, JWT_SECRET } = require('../config');

const authGuard = (req, res, next) => {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    return res.redirect('/login?notice=signin');
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    res.clearCookie(COOKIE_NAME);
    return res.redirect('/login?notice=expired');
  }
};

module.exports = authGuard;
