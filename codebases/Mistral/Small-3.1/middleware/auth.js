// Middleware to check if user is logged in
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

// Middleware to check if user is already logged in
function redirectIfLoggedIn(req, res, next) {
  if (req.session.userId) {
    return res.redirect('/');
  }
  next();
}

module.exports = {
  requireLogin,
  redirectIfLoggedIn
};
