const Donation = require('../models/Donation');
const User = require('../models/User');

const getLandingPage = async (req, res) => {
  try {
    const totalDonations = await Donation.countDocuments();
    const completedDonations = await Donation.countDocuments({ status: 'Completed' });
    const availableCount = await Donation.countDocuments({ status: 'Available', expiryTime: { $gt: new Date() } });
    
    const redistributedAgg = await Donation.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, totalQty: { $sum: '$quantity' } } }
    ]);
    const totalFoodRedistributed = redistributedAgg.length > 0 ? redistributedAgg[0].totalQty : 0;

    const ngoCount = await User.countDocuments({ role: 'ngo', isActive: true });
    const donorCount = await User.countDocuments({ role: 'donor', isActive: true });

    res.render('index', {
      title: 'FoodShare - Food Waste Donation & Redistribution Platform',
      stats: {
        totalDonations,
        completedDonations,
        availableCount,
        totalFoodRedistributed,
        ngoCount,
        donorCount
      }
    });
  } catch (error) {
    console.error('Landing page stats error:', error);
    res.render('index', {
      title: 'FoodShare - Food Waste Donation & Redistribution Platform',
      stats: {
        totalDonations: 0,
        completedDonations: 0,
        availableCount: 0,
        totalFoodRedistributed: 0,
        ngoCount: 0,
        donorCount: 0
      }
    });
  }
};

module.exports = {
  getLandingPage
};
