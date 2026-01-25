const express = require('express');

module.exports = function(requireAuth, db) {
  const router = express.Router();

  const getInbox = require('../db').getInbox;
  const getMessageById = require('../db').getMessageById;
  const createMessage = require('../db').createMessage;

  router.get('/messages', requireAuth, (req, res) => {
    const inbox = getInbox(req.session.userId);
    res.render('messages', { title: 'Inbox', inbox });
  });

  router.get('/messages/:id', requireAuth, (req, res) => {
    const message = getMessageById(req.session.userId, Number(req.params.id));
    if (!message) {
      req.session.flash = { type: 'error', message: 'Message not found.' };
      return res.redirect('/messages');
    }
    res.render('message_detail', { title: message.subject, message });
  });

  router.get('/compose', requireAuth, (req, res) => {
    res.render('compose', { title: 'Compose' });
  });

  router.post('/compose', requireAuth, (req, res) => {
    const { to = '', subject = '', body = '' } = req.body;
    const recipientEmail = String(to).trim().toLowerCase();
    const cleanSubject = String(subject).trim().slice(0, 200) || 'No subject';
    const cleanBody = String(body).trim().slice(0, 5000);

    const result = createMessage(req.session.userId, recipientEmail, cleanSubject, cleanBody);
    if (!result.ok) {
      req.session.flash = { type: 'error', message: result.error };
      return res.redirect('/compose');
    }
    req.session.flash = { type: 'success', message: 'Message sent.' };
    res.redirect('/messages');
  });

  return router;
};
