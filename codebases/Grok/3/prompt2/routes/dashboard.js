const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/dashboard', auth, dashboardController.getDashboard);
router.post('/message', auth, dashboardController.postMessage);

module.exports = router;