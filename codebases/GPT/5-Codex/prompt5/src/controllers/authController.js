import bcrypt from "bcrypt";

import { findUserByEmail } from "../db/userRepository.js";

export function showLogin(req, res) {
  if (req.session?.userId) {
    return res.redirect("/messages");
  }

  res.render("login", {
    title: "BlueMind Secure Mail",
    error: null,
    email: "",
  });
}

export async function handleLogin(req, res, next) {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email ?? "");
    if (!user) {
      return res.status(401).render("login", {
        title: "BlueMind Secure Mail",
        error: "Invalid login credentials.",
        email,
      });
    }

    const passwordMatches = await bcrypt.compare(password ?? "", user.password_hash);

    if (!passwordMatches) {
      return res.status(401).render("login", {
        title: "BlueMind Secure Mail",
        error: "Invalid login credentials.",
        email,
      });
    }

    req.session.userId = user.id;
    res.redirect("/messages");
  } catch (error) {
    next(error);
  }
}

export function handleLogout(req, res) {
  req.session.destroy(() => {
    res.clearCookie("sid");
    res.redirect("/login");
  });
}
