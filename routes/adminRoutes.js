const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuth, isRole } = require('../middleware/authMiddleware');
const { checkExpiredDonations } = require('../middleware/expiryMiddleware');

// All routes require Admin authentication
router.use(isAuth, isRole('admin'), checkExpiredDonations);

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.post('/users/toggle/:id', adminController.postToggleUserStatus);
router.get('/stats', adminController.getStats);

module.exports = router;
