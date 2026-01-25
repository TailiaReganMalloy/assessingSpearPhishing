// Ensure user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/');
};

module.exports = { ensureAuthenticated };