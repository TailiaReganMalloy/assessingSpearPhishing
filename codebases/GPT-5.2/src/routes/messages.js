const express = require('express');
const { body, param, validationResult } = require('express-validator');

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  return next();
}

function messageRoutes({ db }) {
  const router = express.Router();

  router.get('/inbox', requireAuth, async (req, res) => {
    const userId = req.session.userId;

    const messages = await new Promise((resolve, reject) => {
      db.all(
        `SELECT m.id, m.subject, m.created_at, m.read_at, u.email AS sender_email
         FROM messages m
         JOIN users u ON u.id = m.sender_user_id
         WHERE m.recipient_user_id = ?
         ORDER BY datetime(m.created_at) DESC
         LIMIT 200`,
        [userId],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        }
      );
    });

    return res.render('inbox', { title: 'Inbox', messages });
  });

  router.get('/messages/:id',
    requireAuth,
    param('id').isInt({ min: 1 }),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render('error', {
          title: 'Invalid Request',
          message: 'Message not found.'
        });
      }

      const userId = req.session.userId;
      const messageId = Number(req.params.id);

      const message = await new Promise((resolve, reject) => {
        db.get(
          `SELECT m.id, m.subject, m.body, m.created_at, m.read_at,
                  su.email AS sender_email, ru.email AS recipient_email
           FROM messages m
           JOIN users su ON su.id = m.sender_user_id
           JOIN users ru ON ru.id = m.recipient_user_id
           WHERE m.id = ? AND m.recipient_user_id = ?`,
          [messageId, userId],
          (err, row) => {
            if (err) return reject(err);
            resolve(row);
          }
        );
      });

      if (!message) {
        return res.status(404).render('error', {
          title: 'Not Found',
          message: 'Message not found.'
        });
      }

      if (!message.read_at) {
        await new Promise((resolve, reject) => {
          db.run('UPDATE messages SET read_at = datetime(\'now\') WHERE id = ? AND recipient_user_id = ?', [messageId, userId], (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
        message.read_at = new Date().toISOString();
      }

      return res.render('message', { title: 'Message', message });
    }
  );

  router.get('/compose', requireAuth, async (req, res) => {
    return res.render('compose', { title: 'Compose', error: null, values: { to: '', subject: '', body: '' } });
  });

  router.post(
    '/compose',
    requireAuth,
    body('to').isEmail().normalizeEmail(),
    body('subject').isString().trim().isLength({ min: 1, max: 120 }),
    body('body').isString().trim().isLength({ min: 1, max: 5000 }),
    async (req, res) => {
      const errors = validationResult(req);
      const values = {
        to: req.body.to || '',
        subject: req.body.subject || '',
        body: req.body.body || ''
      };

      if (!errors.isEmpty()) {
        return res.status(400).render('compose', {
          title: 'Compose',
          error: 'Please fill in all fields correctly.',
          values
        });
      }

      const senderUserId = req.session.userId;
      const toEmail = req.body.to;

      const recipient = await new Promise((resolve, reject) => {
        db.get('SELECT id, email FROM users WHERE email = ?', [toEmail], (err, row) => {
          if (err) return reject(err);
          resolve(row);
        });
      });

      if (!recipient) {
        return res.status(404).render('compose', {
          title: 'Compose',
          error: 'Recipient not found.',
          values
        });
      }

      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO messages (sender_user_id, recipient_user_id, subject, body) VALUES (?, ?, ?, ?)',
          [senderUserId, recipient.id, req.body.subject.trim(), req.body.body.trim()],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });

      return res.redirect('/inbox');
    }
  );

  return router;
}

module.exports = messageRoutes;
