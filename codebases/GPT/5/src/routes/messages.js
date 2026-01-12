const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth } = require('../middleware');
const { encrypt, decrypt } = require('../crypto');

const router = express.Router();

router.get('/inbox', requireAuth, async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const rows = await db.all(
      `SELECT m.id, u1.username AS sender, u2.username AS recipient, m.body, m.iv, m.tag, m.created_at
       FROM messages m
       JOIN users u1 ON u1.id = m.sender_id
       JOIN users u2 ON u2.id = m.recipient_id
       WHERE m.recipient_id = ?
       ORDER BY m.created_at DESC`,
      [userId]
    );

    const messages = rows.map(r => ({
      id: r.id,
      sender: r.sender,
      created_at: r.created_at,
      text: safeDecrypt(r.body, r.iv, r.tag)
    }));

    const users = await db.all('SELECT username FROM users WHERE id != ? ORDER BY username', [userId]);

    res.render('inbox', {
      title: 'Inbox',
      messages,
      users,
      errors: []
    });
  } catch (err) { next(err); }
});

function safeDecrypt(body, iv, tag) {
  try { return decrypt(body, iv, tag); } catch (_) { return '[Unable to decrypt]'; }
}

router.post('/messages', requireAuth, [
  body('to').trim().isLength({ min: 1 }),
  body('text').trim().isLength({ min: 1, max: 2000 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const mapped = errors.array();
      // Re-render inbox with errors
      const userId = req.session.user.id;
      const rows = await db.all(
        `SELECT m.id, u1.username AS sender, u2.username AS recipient, m.body, m.iv, m.tag, m.created_at
         FROM messages m
         JOIN users u1 ON u1.id = m.sender_id
         JOIN users u2 ON u2.id = m.recipient_id
         WHERE m.recipient_id = ?
         ORDER BY m.created_at DESC`,
        [userId]
      );
      const messages = rows.map(r => ({ id: r.id, sender: r.sender, created_at: r.created_at, text: safeDecrypt(r.body, r.iv, r.tag) }));
      const users = await db.all('SELECT username FROM users WHERE id != ? ORDER BY username', [userId]);
      return res.status(400).render('inbox', { title: 'Inbox', messages, users, errors: mapped });
    }

    const { to, text } = req.body;
    const senderId = req.session.user.id;
    const recipient = await db.get('SELECT id FROM users WHERE username = ?', [to]);
    if (!recipient) return res.status(400).redirect('/inbox');

    const enc = encrypt(text);
    await db.run(
      'INSERT INTO messages (sender_id, recipient_id, body, iv, tag) VALUES (?, ?, ?, ?, ?)',
      [senderId, recipient.id, enc.body, enc.iv, enc.tag]
    );

    res.redirect('/inbox');
  } catch (err) { next(err); }
});

module.exports = router;
