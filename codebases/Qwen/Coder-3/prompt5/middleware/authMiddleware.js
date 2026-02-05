// Middleware to check if user is authenticated
exports.isAuthenticated = (req, res, next) => {
  // Check if userId exists in session
  if (req.session.userId) {
    // User is authenticated, proceed to next middleware/route handler
    return next();
  }
  
  // User is not authenticated, redirect to login page
  res.redirect('/login');
};