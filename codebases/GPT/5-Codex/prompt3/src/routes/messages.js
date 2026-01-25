import { Router } from 'express';
import { all, get, run } from '../db/index.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const messages = await all(
      `SELECT m.id, m.subject, m.body, m.created_at as createdAt,
              sender.display_name as senderName, sender.email as senderEmail
         FROM messages m
         JOIN users sender ON sender.id = m.sender_id
        WHERE m.recipient_id = ?
        ORDER BY m.created_at DESC`,
      [req.session.user.id]
    );

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load messages.' });
  }
});

router.get('/sent', async (req, res) => {
  try {
    const messages = await all(
      `SELECT m.id, m.subject, m.body, m.created_at as createdAt,
              recipient.display_name as recipientName, recipient.email as recipientEmail
         FROM messages m
         JOIN users recipient ON recipient.id = m.recipient_id
        WHERE m.sender_id = ?
        ORDER BY m.created_at DESC`,
      [req.session.user.id]
    );

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load sent messages.' });
  }
});

router.post('/', async (req, res) => {
  const { recipientEmail, subject, body } = req.body;

  if (!recipientEmail || !subject || !body) {
    res.status(400).json({ error: 'recipientEmail, subject, and body are required.' });
    return;
  }

  const trimmedEmail = String(recipientEmail).trim().toLowerCase();
  if (trimmedEmail === req.session.user.email) {
    res.status(400).json({ error: 'Cannot send messages to yourself.' });
    return;
  }

  try {
    const recipient = await get('SELECT id FROM users WHERE email = ?', [trimmedEmail]);
    if (!recipient) {
      res.status(404).json({ error: 'Recipient not found.' });
      return;
    }

    const { id } = await run(
      'INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?)',
      [req.session.user.id, recipient.id, String(subject).trim(), String(body).trim()]
    );

    res.status(201).json({ message: 'Message sent.', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

export default router;
