const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');
const { checkExpiredDonations } = require('../middleware/expiryMiddleware');

router.get('/', checkExpiredDonations, indexController.getLandingPage);

module.exports = router;
