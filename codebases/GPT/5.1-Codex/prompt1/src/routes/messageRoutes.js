const express = require('express');
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
const authGuard = require('../middleware/authGuard');
const { all } = require('../db');
const { APP_NAME } = require('../config');

dayjs.extend(relativeTime);

const router = express.Router();
router.use(authGuard);

const selectMessages = `
  SELECT m.id,
         m.subject,
         m.body,
         m.sent_at,
         u.display_name AS sender_name
  FROM messages m
  JOIN users u ON u.id = m.sender_id
  WHERE m.recipient_id = ?
  ORDER BY m.sent_at DESC
`;

router.get('/', async (req, res) => {
  try {
    const rows = await all(selectMessages, [req.user.id]);
    const messages = rows.map((row) => ({
      ...row,
      sentRelative: dayjs(row.sent_at).fromNow(),
      sentAbsolute: dayjs(row.sent_at).format('MMM D, YYYY h:mm A')
    }));

    return res.render('inbox', {
      title: `${APP_NAME} | Inbox`,
      user: req.user,
      messages,
      error: null
    });
  } catch (err) {
    return res.status(500).render('inbox', {
      title: `${APP_NAME} | Inbox`,
      user: req.user,
      messages: [],
      error: 'We could not load your messages right now. Please refresh.'
    });
  }
});

router.get('/feed', async (req, res) => {
  try {
    const rows = await all(selectMessages, [req.user.id]);
    return res.json({ messages: rows });
  } catch (err) {
    return res.status(500).json({ error: 'Unable to fetch messages.' });
  }
});

module.exports = router;
