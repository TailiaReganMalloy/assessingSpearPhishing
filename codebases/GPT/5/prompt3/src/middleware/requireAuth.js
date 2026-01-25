module.exports = function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  // Distinguish API vs page
  const wantsJSON = req.headers.accept && req.headers.accept.includes('application/json');
  if (wantsJSON) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  return res.redirect('/login');
};
