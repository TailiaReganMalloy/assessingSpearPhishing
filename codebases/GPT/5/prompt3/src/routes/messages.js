const express = require('express');
const { z } = require('zod');
const requireAuth = require('../middleware/requireAuth');
const {
  getUserById,
  getUserByEmail,
  listUsersExcept,
  getInbox,
  getSent,
  createMessage,
  markRead
} = require('../db');

const router = express.Router();

router.get('/inbox', requireAuth, async (req, res) => {
  const messages = await getInbox(req.session.userId);
  res.render('inbox', { title: 'Inbox', messages });
});

router.get('/sent', requireAuth, async (req, res) => {
  const messages = await getSent(req.session.userId);
  res.render('sent', { title: 'Sent', messages });
});

router.get('/compose', requireAuth, async (req, res) => {
  const recipients = await listUsersExcept(req.session.userId);
  res.render('compose', { title: 'Compose', recipients });
});

const composeSchema = z.object({
  recipientEmail: z.string().email(),
  content: z.string().min(1).max(5000)
});

router.post('/messages', requireAuth, async (req, res) => {
  try {
    const { recipientEmail, content } = composeSchema.parse(req.body);
    const recipient = await getUserByEmail(recipientEmail.toLowerCase());
    if (!recipient) {
      const recipients = await listUsersExcept(req.session.userId);
      return res.status(400).render('compose', { title: 'Compose', error: 'Recipient not found', recipients });
    }
    await createMessage(req.session.userId, recipient.id, content);
    return res.redirect('/inbox');
  } catch (err) {
    const recipients = await listUsersExcept(req.session.userId);
    return res.status(400).render('compose', { title: 'Compose', error: 'Invalid payload', recipients });
  }
});

router.post('/messages/:id/read', requireAuth, async (req, res) => {
  const messageId = Number(req.params.id);
  await markRead(messageId, req.session.userId);
  res.redirect('/inbox');
});

router.get('/', async (req, res) => {
  if (!req.session.userId) return res.render('home', { title: 'Home' });
  const user = await getUserById(req.session.userId);
  res.render('home', { title: 'Home', user });
});

module.exports = router;
