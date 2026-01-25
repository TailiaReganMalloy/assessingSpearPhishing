const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const messageController = require('../controllers/messageController');

const router = Router();

router.get('/', (req, res) => {
  if (req.user) {
    return res.redirect('/dashboard');
  }
  return res.redirect('/login');
});

router.get('/dashboard', requireAuth, messageController.renderDashboard);

module.exports = router;
