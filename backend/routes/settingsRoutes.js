const express = require('express');
const router = express.Router();
const { getPublicSettings } = require('../controllers/adminSettingsController');

// Public, read-only UI/branding settings for the frontend
router.get('/public', getPublicSettings);

module.exports = router;
