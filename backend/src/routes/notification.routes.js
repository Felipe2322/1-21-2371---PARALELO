const express = require('express');
const router  = express.Router();
const { sendNotification } = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');

// POST /api/notifications/send
router.post('/send', authenticate, sendNotification);

module.exports = router;
