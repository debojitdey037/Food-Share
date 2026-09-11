const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    foodType: {
      type: String,
      required: [true, 'Food type is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    unit: {
      type: String,
      required: [true, 'Unit of measurement is required'],
      enum: ['servings', 'kg', 'packets', 'boxes', 'liters', 'meals'],
      default: 'servings',
    },
    pickupLocation: {
      type: String,
      required: [true, 'Pickup location is required'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Pincode / Area code is required'],
      trim: true,
    },
    prepTime: {
      type: Date,
      required: [true, 'Preparation time is required'],
    },
    expiryTime: {
      type: Date,
      required: [true, 'Expiry time is required'],
    },
    status: {
      type: String,
      enum: ['Available', 'Accepted', 'PickedUp', 'Completed', 'Cancelled', 'Expired'],
      default: 'Available',
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient sorting and status checks
donationSchema.index({ status: 1, expiryTime: 1 });
donationSchema.index({ pincode: 1 });

module.exports = mongoose.model('Donation', donationSchema);
