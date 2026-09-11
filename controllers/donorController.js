const Donation = require('../models/Donation');

// GET /donor/dashboard
const getDashboard = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.session.user._id })
      .populate('acceptedBy', 'name organizationName phone email')
      .sort({ createdAt: -1 });

    res.render('donor/dashboard', {
      title: 'Donor Dashboard - FoodShare',
      donations,
    });
  } catch (error) {
    console.error('Donor dashboard error:', error);
    req.flash('error_msg', 'Failed to load donations list.');
    res.redirect('/');
  }
};

// GET /donor/create
const getCreateDonation = (req, res) => {
  res.render('donor/create', {
    title: 'Post Surplus Food - FoodShare',
    errors: [],
    formData: {
      pickupLocation: req.session.user.address || '',
      pincode: req.session.user.pincode || '',
    },
  });
};

// POST /donor/create
const postCreateDonation = async (req, res) => {
  const { foodType, quantity, unit, pickupLocation, pincode, prepTime, expiryTime, notes } = req.body;
  const errors = [];
  const formData = { foodType, quantity, unit, pickupLocation, pincode, prepTime, expiryTime, notes };

  if (!foodType || !quantity || !unit || !pickupLocation || !pincode || !prepTime || !expiryTime) {
    errors.push({ msg: 'Please complete all required fields.' });
  }

  if (quantity && Number(quantity) <= 0) {
    errors.push({ msg: 'Quantity must be greater than zero.' });
  }

  const prepDate = new Date(prepTime);
  const expiryDate = new Date(expiryTime);

  if (isNaN(prepDate.getTime()) || isNaN(expiryDate.getTime())) {
    errors.push({ msg: 'Please enter valid preparation and expiry dates.' });
  } else if (expiryDate <= prepDate) {
    errors.push({ msg: 'Expiry time must be after preparation time.' });
  } else if (expiryDate <= new Date()) {
    errors.push({ msg: 'Expiry time must be in the future.' });
  }

  if (errors.length > 0) {
    return res.render('donor/create', {
      title: 'Post Surplus Food - FoodShare',
      errors,
      formData,
    });
  }

  try {
    const newDonation = new Donation({
      donorId: req.session.user._id,
      foodType,
      quantity: Number(quantity),
      unit,
      pickupLocation,
      pincode,
      prepTime: prepDate,
      expiryTime: expiryDate,
      notes: notes || '',
      status: 'Available',
    });

    await newDonation.save();
    req.flash('success_msg', 'Donation post created successfully! NGOs in your area can now view and accept it.');
    res.redirect('/donor/dashboard');
  } catch (error) {
    console.error('Create donation error:', error);
    errors.push({ msg: 'Error creating donation post. Please check inputs and try again.' });
    res.render('donor/create', {
      title: 'Post Surplus Food - FoodShare',
      errors,
      formData,
    });
  }
};

// GET /donor/edit/:id
const getEditDonation = async (req, res) => {
  try {
    const donation = await Donation.findOne({
      _id: req.params.id,
      donorId: req.session.user._id,
    });

    if (!donation) {
      req.flash('error_msg', 'Donation post not found.');
      return res.redirect('/donor/dashboard');
    }

    if (donation.status !== 'Available') {
      req.flash('error_msg', `Cannot edit donation post in '${donation.status}' status.`);
      return res.redirect('/donor/dashboard');
    }

    // Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
    const formatDateTime = (date) => {
      const d = new Date(date);
      const pad = (n) => (n < 10 ? '0' + n : n);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    res.render('donor/edit', {
      title: 'Edit Donation Post - FoodShare',
      donation,
      errors: [],
      prepTimeFormatted: formatDateTime(donation.prepTime),
      expiryTimeFormatted: formatDateTime(donation.expiryTime),
    });
  } catch (error) {
    console.error('Get edit donation error:', error);
    req.flash('error_msg', 'Error loading donation post.');
    res.redirect('/donor/dashboard');
  }
};

// POST /donor/edit/:id
const postEditDonation = async (req, res) => {
  const { foodType, quantity, unit, pickupLocation, pincode, prepTime, expiryTime, notes } = req.body;
  const errors = [];

  try {
    const donation = await Donation.findOne({
      _id: req.params.id,
      donorId: req.session.user._id,
    });

    if (!donation) {
      req.flash('error_msg', 'Donation post not found.');
      return res.redirect('/donor/dashboard');
    }

    if (donation.status !== 'Available') {
      req.flash('error_msg', 'Only "Available" donations can be edited.');
      return res.redirect('/donor/dashboard');
    }

    if (!foodType || !quantity || !unit || !pickupLocation || !pincode || !prepTime || !expiryTime) {
      errors.push({ msg: 'Please fill in all required fields.' });
    }

    const prepDate = new Date(prepTime);
    const expiryDate = new Date(expiryTime);

    if (expiryDate <= prepDate) {
      errors.push({ msg: 'Expiry time must be after preparation time.' });
    }

    if (errors.length > 0) {
      return res.render('donor/edit', {
        title: 'Edit Donation Post - FoodShare',
        donation: { ...donation.toObject(), ...req.body },
        errors,
        prepTimeFormatted: prepTime,
        expiryTimeFormatted: expiryTime,
      });
    }

    donation.foodType = foodType;
    donation.quantity = Number(quantity);
    donation.unit = unit;
    donation.pickupLocation = pickupLocation;
    donation.pincode = pincode;
    donation.prepTime = prepDate;
    donation.expiryTime = expiryDate;
    donation.notes = notes || '';

    await donation.save();

    req.flash('success_msg', 'Donation post updated successfully!');
    res.redirect('/donor/dashboard');
  } catch (error) {
    console.error('Post edit donation error:', error);
    req.flash('error_msg', 'Error updating donation post.');
    res.redirect('/donor/dashboard');
  }
};

// POST /donor/cancel/:id
const postCancelDonation = async (req, res) => {
  try {
    const donation = await Donation.findOne({
      _id: req.params.id,
      donorId: req.session.user._id,
    });

    if (!donation) {
      req.flash('error_msg', 'Donation post not found.');
      return res.redirect('/donor/dashboard');
    }

    if (donation.status !== 'Available') {
      req.flash('error_msg', `Cannot cancel a post that is already '${donation.status}'.`);
      return res.redirect('/donor/dashboard');
    }

    donation.status = 'Cancelled';
    await donation.save();

    req.flash('success_msg', 'Donation post has been cancelled.');
    res.redirect('/donor/dashboard');
  } catch (error) {
    console.error('Cancel donation error:', error);
    req.flash('error_msg', 'Error cancelling donation post.');
    res.redirect('/donor/dashboard');
  }
};

module.exports = {
  getDashboard,
  getCreateDonation,
  postCreateDonation,
  getEditDonation,
  postEditDonation,
  postCancelDonation,
};
