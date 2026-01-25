const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');

const router = express.Router();

router.get('/inbox', async (req, res) => {
  const inbox = await db.getInbox(req.session.user.id);
  res.render('inbox', { title: 'Inbox', inbox });
});

router.get('/compose', async (req, res) => {
  const users = await db.listUsers();
  res.render('compose', { title: 'Compose', users });
});

router.post(
  '/compose',
  body('recipient').isInt().withMessage('Recipient required'),
  body('content').isString().isLength({ min: 1, max: 2000 }).withMessage('Message content required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const users = await db.listUsers();
      return res.status(400).render('compose', { title: 'Compose', users, error: errors.array()[0].msg });
    }
    const { recipient, content } = req.body;
    // EJS escapes output; store raw text content
    await db.createMessage(req.session.user.id, parseInt(recipient, 10), content);
    res.redirect('/messages/inbox');
  }
);

module.exports = router;