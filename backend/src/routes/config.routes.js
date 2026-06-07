const express = require('express');
const router = express.Router();
const { getConfig } = require('../controllers/config.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, getConfig);

module.exports = router;
