const { findById } = require('../repositories/userRepository');

const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  return next();
};

const attachUser = async (req, res, next) => {
  if (!req.session.userId) {
    res.locals.currentUser = null;
    return next();
  }

  try {
    const user = await findById(req.session.userId);
    if (!user) {
      req.session.destroy(() => {
        res.redirect('/');
      });
      return;
    }
    res.locals.currentUser = user;
    req.currentUser = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  requireAuth,
  attachUser
};
