const express = require("express");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcrypt");
const { findUserByEmail } = require("../data/store");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false
});

router.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/inbox");
  }
  return res.redirect("/login");
});

router.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/inbox");
  }
  return res.render("login", {
    error: "",
    formData: { email: "", device: "private" }
  });
});

router.post("/login", loginLimiter, async (req, res) => {
  const { email = "", password = "", device = "private" } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  const formData = { email: normalizedEmail, device };

  if (!normalizedEmail || !password) {
    return res.status(400).render("login", {
      error: "Email and password are required.",
      formData
    });
  }

  const user = findUserByEmail(normalizedEmail);
  if (!user) {
    return res.status(401).render("login", {
      error: "Invalid credentials.",
      formData
    });
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    return res.status(401).render("login", {
      error: "Invalid credentials.",
      formData
    });
  }

  req.session.user = {
    id: user.id,
    email: user.email,
    displayName: user.displayName
  };

  req.session.device = device === "public" ? "public" : "private";

  req.session.cookie.maxAge =
    req.session.device === "public" ? 1000 * 60 * 10 : 1000 * 60 * 60;

  return res.redirect("/inbox");
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("bluemind.sid");
    return res.redirect("/login");
  });
});

module.exports = router;
