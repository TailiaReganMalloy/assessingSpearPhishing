import { findUserById } from "../db/userRepository.js";

export async function attachUserToLocals(req, res, next) {
  res.locals.csrfToken = req.csrfToken?.() ?? "";

  if (!req.session?.userId) {
    res.locals.currentUser = null;
    return next();
  }

  try {
    const user = await findUserById(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      res.locals.currentUser = null;
      return next();
    }

    res.locals.currentUser = {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
    };
    return next();
  } catch (error) {
    return next(error);
  }
}
