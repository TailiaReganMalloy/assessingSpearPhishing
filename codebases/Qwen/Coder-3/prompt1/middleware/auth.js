// Authentication middleware to protect routes
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    // User is authenticated
    next();
  } else {
    // User is not authenticated
    res.redirect('/auth/login');
  }
}

module.exports = {
  requireAuth
};