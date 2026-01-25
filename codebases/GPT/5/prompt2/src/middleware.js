export function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect('/login');
}

export function attachUser(req, res, next) {
  res.locals.currentUser = req.session?.user || null;
  next();
}

export function noCache(req, res, next) {
  res.set('Cache-Control', 'no-store');
  next();
}
