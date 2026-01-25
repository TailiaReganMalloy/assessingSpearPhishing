const { validationResult } = require('express-validator');
const messageModel = require('../models/messageModel');
const userModel = require('../models/userModel');

function renderDashboard(req, res) {
  const inbox = messageModel.getInbox(req.user.id);
  const sent = messageModel.getSent(req.user.id);
  const recipients = userModel.listOtherUsers(req.user.id);

  res.render('dashboard', {
    title: 'Inbox',
    inbox,
    sent,
    recipients,
    formErrors: [],
    formValues: { recipientId: recipients[0]?.id || '', subject: '', body: '' },
  });
}

function renderDashboardWithErrors(req, res, errors, values) {
  const inbox = messageModel.getInbox(req.user.id);
  const sent = messageModel.getSent(req.user.id);
  const recipients = userModel.listOtherUsers(req.user.id);

  res.status(422).render('dashboard', {
    title: 'Inbox',
    inbox,
    sent,
    recipients,
    formErrors: errors,
    formValues: values,
  });
}

function handleSendMessage(req, res) {
  const errors = validationResult(req);
  const { recipientId, subject, body } = req.body;
  const safeValues = {
    recipientId,
    subject,
    body,
  };

  if (!errors.isEmpty()) {
    return renderDashboardWithErrors(req, res, errors.array(), safeValues);
  }

  const recipient = userModel.findById(Number(recipientId));

  if (!recipient) {
    return renderDashboardWithErrors(req, res, [{ msg: 'Selected recipient does not exist.' }], safeValues);
  }

  if (recipient.id === req.user.id) {
    return renderDashboardWithErrors(req, res, [{ msg: 'You cannot send a message to yourself.' }], safeValues);
  }

  messageModel.createMessage({
    senderId: req.user.id,
    recipientId: recipient.id,
    subject,
    body,
  });

  req.session.flash = { type: 'success', message: 'Message delivered securely.' };
  return req.session.save(() => res.redirect('/dashboard'));
}

module.exports = {
  renderDashboard,
  handleSendMessage,
};
