const Donation = require('../models/Donation');

// GET /ngo/feed
const getFeed = async (req, res) => {
  try {
    const { search } = req.query;
    const query = {
      status: 'Available',
      expiryTime: { $gt: new Date() },
    };

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { pincode: searchRegex },
        { pickupLocation: searchRegex },
        { foodType: searchRegex },
      ];
    }

    const availableDonations = await Donation.find(query)
      .populate('donorId', 'name organizationName phone email address pincode')
      .sort({ expiryTime: 1 });

    res.render('ngo/feed', {
      title: 'Available Food Feed - FoodShare',
      donations: availableDonations,
      searchQuery: search || '',
    });
  } catch (error) {
    console.error('NGO Feed error:', error);
    req.flash('error_msg', 'Failed to fetch available food feed.');
    res.redirect('/');
  }
};

// POST /ngo/accept/:id
const postAcceptDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      req.flash('error_msg', 'Donation post not found.');
      return res.redirect('/ngo/feed');
    }

    if (donation.status !== 'Available') {
      req.flash('error_msg', 'This donation post is no longer available.');
      return res.redirect('/ngo/feed');
    }

    if (new Date() >= donation.expiryTime) {
      donation.status = 'Expired';
      await donation.save();
      req.flash('error_msg', 'This donation post has expired and cannot be accepted.');
      return res.redirect('/ngo/feed');
    }

    donation.status = 'Accepted';
    donation.acceptedBy = req.session.user._id;
    await donation.save();

    req.flash('success_msg', 'You have successfully accepted this donation! Contact the donor for pickup details.');
    res.redirect('/ngo/history');
  } catch (error) {
    console.error('Accept donation error:', error);
    req.flash('error_msg', 'Error accepting donation post.');
    res.redirect('/ngo/feed');
  }
};

// POST /ngo/status/:id
const postUpdateStatus = async (req, res) => {
  const { newStatus } = req.body;
  const validTransitions = {
    Accepted: 'PickedUp',
    PickedUp: 'Completed',
  };

  try {
    const donation = await Donation.findOne({
      _id: req.params.id,
      acceptedBy: req.session.user._id,
    });

    if (!donation) {
      req.flash('error_msg', 'Accepted donation record not found.');
      return res.redirect('/ngo/history');
    }

    const expectedNextStatus = validTransitions[donation.status];
    if (!expectedNextStatus || newStatus !== expectedNextStatus) {
      req.flash('error_msg', `Invalid status transition from ${donation.status} to ${newStatus}.`);
      return res.redirect('/ngo/history');
    }

    donation.status = newStatus;
    await donation.save();

    req.flash('success_msg', `Donation status updated to '${newStatus}'.`);
    res.redirect('/ngo/history');
  } catch (error) {
    console.error('Update donation status error:', error);
    req.flash('error_msg', 'Error updating pickup status.');
    res.redirect('/ngo/history');
  }
};

// GET /ngo/history
const getHistory = async (req, res) => {
  try {
    const acceptedDonations = await Donation.find({
      acceptedBy: req.session.user._id,
    })
      .populate('donorId', 'name organizationName phone email address pincode')
      .sort({ updatedAt: -1 });

    res.render('ngo/history', {
      title: 'My Claimed Donations - FoodShare',
      donations: acceptedDonations,
    });
  } catch (error) {
    console.error('NGO history error:', error);
    req.flash('error_msg', 'Failed to load claimed donations history.');
    res.redirect('/ngo/feed');
  }
};

module.exports = {
  getFeed,
  postAcceptDonation,
  postUpdateStatus,
  getHistory,
};
