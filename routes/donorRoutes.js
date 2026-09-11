const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donorController');
const { isAuth, isRole } = require('../middleware/authMiddleware');
const { checkExpiredDonations } = require('../middleware/expiryMiddleware');

// All routes require donor authentication
router.use(isAuth, isRole('donor'), checkExpiredDonations);

router.get('/dashboard', donorController.getDashboard);
router.get('/create', donorController.getCreateDonation);
router.post('/create', donorController.postCreateDonation);
router.get('/edit/:id', donorController.getEditDonation);
router.post('/edit/:id', donorController.postEditDonation);
router.post('/cancel/:id', donorController.postCancelDonation);

module.exports = router;
