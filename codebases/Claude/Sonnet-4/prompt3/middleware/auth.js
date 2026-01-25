// Authentication middleware to protect routes
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    req.flash('error', 'You must be logged in to access this page.');
    return res.redirect('/auth/login');
  }
}

// Middleware to redirect authenticated users away from auth pages
function redirectIfAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect('/messages');
  }
  next();
}

module.exports = {
  requireAuth,
  redirectIfAuthenticated
};