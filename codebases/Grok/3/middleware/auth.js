const jwt = require('jsonwebtoken');

// Middleware to check if user is authenticated
const authenticateToken = (req, res, next) => {
  const token = req.session.token;

  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  }
};

module.exports = authenticateToken;