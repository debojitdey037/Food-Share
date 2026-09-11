const express = require('express');
const router = express.Router();
const ngoController = require('../controllers/ngoController');
const { isAuth, isRole } = require('../middleware/authMiddleware');
const { checkExpiredDonations } = require('../middleware/expiryMiddleware');

// All routes require NGO authentication
router.use(isAuth, isRole('ngo'), checkExpiredDonations);

router.get('/feed', ngoController.getFeed);
router.post('/accept/:id', ngoController.postAcceptDonation);
router.post('/status/:id', ngoController.postUpdateStatus);
router.get('/history', ngoController.getHistory);

module.exports = router;
