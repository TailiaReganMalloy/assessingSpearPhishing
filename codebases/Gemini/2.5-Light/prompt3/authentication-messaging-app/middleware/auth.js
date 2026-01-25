const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // If no token, return 401 Unauthorized

  jwt.verify(token, 'your_jwt_secret_key', (err, user) => { // Use the same secret key
    if (err) return res.sendStatus(403); // If token is invalid, return 403 Forbidden
    req.user = user; // Attach user info to the request
    next();
  });
};

module.exports = authenticateToken;
