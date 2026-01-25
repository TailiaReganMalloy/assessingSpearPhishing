/**
 * Authentication Middleware
 * 
 * This middleware checks if a user is authenticated by verifying
 * the presence of a valid session userId.
 */

module.exports = function (req, res, next) {
  if (!req.session.userId) {
    return res.status(401).redirect('/');
  }
  next();
};
