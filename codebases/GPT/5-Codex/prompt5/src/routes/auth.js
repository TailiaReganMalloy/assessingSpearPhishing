import { Router } from "express";

import { handleLogin, handleLogout, showLogin } from "../controllers/authController.js";

const router = Router();

router.get("/", (req, res) => {
  if (req.session?.userId) {
    return res.redirect("/messages");
  }
  res.redirect("/login");
});

router.get("/login", showLogin);
router.post("/login", handleLogin);
router.post("/logout", handleLogout);

export default router;
