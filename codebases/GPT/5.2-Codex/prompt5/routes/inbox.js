const express = require("express");
const { ensureAuthenticated } = require("../middleware/auth");
const { getMessagesForUser, getMessageById } = require("../data/store");

const router = express.Router();

router.get("/inbox", ensureAuthenticated, (req, res) => {
  const messages = getMessagesForUser(req.session.user.id);
  return res.render("inbox", {
    messages,
    displayName: req.session.user.displayName,
    device: req.session.device || "private"
  });
});

router.get("/message/:id", ensureAuthenticated, (req, res) => {
  const message = getMessageById(req.session.user.id, req.params.id);
  if (!message) {
    return res.status(404).render("message", {
      message: null,
      displayName: req.session.user.displayName
    });
  }
  return res.render("message", {
    message,
    displayName: req.session.user.displayName
  });
});

module.exports = router;
