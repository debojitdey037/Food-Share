const Donation = require('../models/Donation');
const cron = require('node-cron');

const updateExpiredDonations = async () => {
  try {
    const result = await Donation.updateMany(
      {
        status: 'Available',
        expiryTime: { $lt: new Date() },
      },
      {
        $set: { status: 'Expired' },
      }
    );
    if (result.modifiedCount > 0) {
      console.log(`[Expiry Service] Updated ${result.modifiedCount} available donation(s) to Expired status.`);
    }
  } catch (error) {
    console.error('[Expiry Service] Error updating expired donations:', error.message);
  }
};

// Express middleware to ensure database state is fresh on read
const checkExpiredDonations = async (req, res, next) => {
  await updateExpiredDonations();
  next();
};

// Scheduled background task running every minute
const initExpiryCron = () => {
  cron.schedule('* * * * *', () => {
    updateExpiredDonations();
  });
  console.log('[Expiry Service] Background cron job initialized (runs every 1 minute).');
};

module.exports = {
  updateExpiredDonations,
  checkExpiredDonations,
  initExpiryCron,
};
