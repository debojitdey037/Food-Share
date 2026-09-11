const User = require('../models/User');
const Donation = require('../models/Donation');

// GET /admin/dashboard - View all donations with filters
const getDashboard = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    const donations = await Donation.find(query)
      .populate('donorId', 'name organizationName email phone pincode')
      .populate('acceptedBy', 'name organizationName email phone')
      .sort({ createdAt: -1 });

    res.render('admin/dashboard', {
      title: 'Admin Dashboard - FoodShare',
      donations,
      currentStatusFilter: status || 'ALL',
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    req.flash('error_msg', 'Failed to load donations list.');
    res.redirect('/');
  }
};

// GET /admin/users - User management (Donors & NGOs)
const getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const query = { role: { $in: ['donor', 'ngo'] } };

    if (role && ['donor', 'ngo'].includes(role)) {
      query.role = role;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { organizationName: searchRegex },
        { pincode: searchRegex },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.render('admin/users', {
      title: 'User Management - FoodShare',
      users,
      currentRoleFilter: role || 'ALL',
      searchQuery: search || '',
    });
  } catch (error) {
    console.error('Admin users error:', error);
    req.flash('error_msg', 'Failed to load users list.');
    res.redirect('/admin/dashboard');
  }
};

// POST /admin/users/toggle/:id - Suspend/Activate User Account
const postToggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      req.flash('error_msg', 'User not found.');
      return res.redirect('/admin/users');
    }

    if (user.role === 'admin') {
      req.flash('error_msg', 'Cannot modify Admin account status.');
      return res.redirect('/admin/users');
    }

    user.isActive = !user.isActive;
    await user.save();

    const actionText = user.isActive ? 'activated' : 'deactivated/suspended';
    req.flash('success_msg', `User '${user.name}' has been ${actionText}.`);
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Toggle user status error:', error);
    req.flash('error_msg', 'Error updating user status.');
    res.redirect('/admin/users');
  }
};

// GET /admin/stats - Analytics & Area-wise breakdown
const getStats = async (req, res) => {
  try {
    const totalDonations = await Donation.countDocuments();
    const activeDonations = await Donation.countDocuments({ status: { $in: ['Available', 'Accepted', 'PickedUp'] } });
    const completedDonations = await Donation.countDocuments({ status: 'Completed' });
    const cancelledDonations = await Donation.countDocuments({ status: 'Cancelled' });
    const expiredDonations = await Donation.countDocuments({ status: 'Expired' });

    // Sum of quantity redistributed (Completed donations)
    const redistributedAgg = await Donation.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, totalQty: { $sum: '$quantity' } } },
    ]);
    const totalQuantityRedistributed = redistributedAgg.length > 0 ? redistributedAgg[0].totalQty : 0;

    // Counts by role
    const donorCount = await User.countDocuments({ role: 'donor', isActive: true });
    const ngoCount = await User.countDocuments({ role: 'ngo', isActive: true });

    // Area/Pincode-wise aggregation
    const pincodeBreakdown = await Donation.aggregate([
      {
        $group: {
          _id: '$pincode',
          totalPosts: { $sum: 1 },
          completedPosts: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
          },
          availablePosts: {
            $sum: { $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] },
          },
          redistributedQty: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, '$quantity', 0] },
          },
        },
      },
      { $sort: { totalPosts: -1 } },
    ]);

    res.render('admin/stats', {
      title: 'Platform Statistics & Impact - FoodShare',
      metrics: {
        totalDonations,
        activeDonations,
        completedDonations,
        cancelledDonations,
        expiredDonations,
        totalQuantityRedistributed,
        donorCount,
        ngoCount,
      },
      pincodeBreakdown,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    req.flash('error_msg', 'Failed to calculate platform statistics.');
    res.redirect('/admin/dashboard');
  }
};

module.exports = {
  getDashboard,
  getUsers,
  postToggleUserStatus,
  getStats,
};
