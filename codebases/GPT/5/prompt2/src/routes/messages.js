import express from 'express';
import csrf from 'csurf';
import { initDB, inboxFor, outboxFor, listUsers, sendMessage, getUserByEmail } from '../db.js';
import { requireAuth } from '../middleware.js';
import { messageSchema } from '../validators.js';

const router = express.Router();
const csrfProtection = csrf();

router.get('/', requireAuth, csrfProtection, async (req, res) => {
  const db = await initDB();
  const [inbox, outbox] = await Promise.all([
    inboxFor(db, req.session.user.id),
    outboxFor(db, req.session.user.id),
  ]);
  res.render('inbox', { inbox, outbox, csrfToken: req.csrfToken() });
});

router.get('/compose', requireAuth, csrfProtection, async (req, res) => {
  const db = await initDB();
  const users = await listUsers(db);
  res.render('compose', { users, csrfToken: req.csrfToken(), error: req.flash('error'), success: req.flash('success') });
});

router.post('/send', requireAuth, csrfProtection, express.urlencoded({ extended: false }), async (req, res) => {
  const parse = messageSchema.safeParse(req.body);
  if (!parse.success) {
    req.flash('error', 'Please check message inputs');
    return res.redirect('/messages/compose');
  }
  const db = await initDB();
  const recipient = await getUserByEmail(db, parse.data.recipientEmail);
  if (!recipient) {
    req.flash('error', 'Recipient not found');
    return res.redirect('/messages/compose');
  }
  await sendMessage(db, {
    sender_id: req.session.user.id,
    recipient_id: recipient.id,
    subject: parse.data.subject,
    body: parse.data.body,
  });
  req.flash('success', 'Message sent');
  res.redirect('/');
});

export default router;
