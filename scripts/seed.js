require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Donation = require('../models/Donation');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodshare';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Donation.deleteMany({});
    console.log('Cleared existing User and Donation collections.');

    // Create Admin user
    const adminUser = new User({
      name: 'Platform Admin',
      email: 'admin@foodshare.org',
      password: 'Admin@123',
      role: 'admin',
      organizationName: 'FoodShare Operations',
      phone: '+1 800-555-0100',
      address: '100 Sustainability Way, Suite 400',
      pincode: '10001',
      isActive: true,
    });
    await adminUser.save();
    console.log('Created Admin User: admin@foodshare.org / Admin@123');

    // Create Donor users
    const donor1 = new User({
      name: 'Chef Marcus Vance',
      email: 'bistro@foodshare.org',
      password: 'Donor@123',
      role: 'donor',
      organizationName: 'Green Bistro Restaurant',
      phone: '+1 555-0144',
      address: '450 Culinary Ave',
      pincode: '10001',
      isActive: true,
    });
    await donor1.save();

    const donor2 = new User({
      name: 'Sarah Jenkins',
      email: 'grandhotel@foodshare.org',
      password: 'Donor@123',
      role: 'donor',
      organizationName: 'Grand Palace Hotel Banquet',
      phone: '+1 555-0188',
      address: '782 Plaza Blvd',
      pincode: '10002',
      isActive: true,
    });
    await donor2.save();
    console.log('Created 2 Donor Users.');

    // Create NGO users
    const ngo1 = new User({
      name: 'David Miller',
      email: 'hopefoodbank@foodshare.org',
      password: 'Ngo@123',
      role: 'ngo',
      organizationName: 'Hope Food Relief Foundation',
      phone: '+1 555-0199',
      address: '12 Charity Street',
      pincode: '10001',
      isActive: true,
    });
    await ngo1.save();

    const ngo2 = new User({
      name: 'Elena Rostova',
      email: 'cityshelter@foodshare.org',
      password: 'Ngo@123',
      role: 'ngo',
      organizationName: 'City Community Kitchen & Shelter',
      phone: '+1 555-0133',
      address: '89 Community Park Drive',
      pincode: '10002',
      isActive: true,
    });
    await ngo2.save();
    console.log('Created 2 NGO Users.');

    // Create Sample Donations
    const now = new Date();
    const addHours = (h) => new Date(now.getTime() + h * 60 * 60 * 1000);
    const subHours = (h) => new Date(now.getTime() - h * 60 * 60 * 1000);

    const sampleDonations = [
      {
        donorId: donor1._id,
        foodType: 'Cooked Dinner Buffet (Rice, Vegetables, Pasta)',
        quantity: 45,
        unit: 'servings',
        pickupLocation: '450 Culinary Ave, Kitchen Back Door',
        pincode: '10001',
        prepTime: subHours(2),
        expiryTime: addHours(5),
        status: 'Available',
        notes: 'Packed in food-grade thermal containers. Vegetarian friendly.',
      },
      {
        donorId: donor2._id,
        foodType: 'Fresh Artisan Bread & Pastries',
        quantity: 30,
        unit: 'boxes',
        pickupLocation: '782 Plaza Blvd, Bakery Loading Bay',
        pincode: '10002',
        prepTime: subHours(3),
        expiryTime: addHours(8),
        status: 'Available',
        notes: 'Assorted sourdough bread, croissants, and muffins from morning banquet.',
      },
      {
        donorId: donor1._id,
        foodType: 'Packed Lunch Boxes (Chicken & Vegetarian Meals)',
        quantity: 60,
        unit: 'packets',
        pickupLocation: '450 Culinary Ave',
        pincode: '10001',
        prepTime: subHours(1),
        expiryTime: addHours(4),
        status: 'Accepted',
        acceptedBy: ngo1._id,
        notes: 'Claimed by Hope Food Relief. Pickup driver assigned.',
      },
      {
        donorId: donor2._id,
        foodType: 'Fresh Fruit Trays & Sandwiches',
        quantity: 25,
        unit: 'boxes',
        pickupLocation: '782 Plaza Blvd',
        pincode: '10002',
        prepTime: subHours(4),
        expiryTime: addHours(3),
        status: 'PickedUp',
        acceptedBy: ngo2._id,
        notes: 'Volunteer picked up at 4 PM. En route to City Shelter.',
      },
      {
        donorId: donor1._id,
        foodType: 'Soup & Fresh Salad Meal Packs',
        quantity: 80,
        unit: 'servings',
        pickupLocation: '450 Culinary Ave',
        pincode: '10001',
        prepTime: subHours(12),
        expiryTime: subHours(2),
        status: 'Completed',
        acceptedBy: ngo1._id,
        notes: 'Successfully distributed at downtown shelter.',
      },
      {
        donorId: donor2._id,
        foodType: 'Breakfast Catering Surplus',
        quantity: 20,
        unit: 'meals',
        pickupLocation: '782 Plaza Blvd',
        pincode: '10002',
        prepTime: subHours(10),
        expiryTime: subHours(1),
        status: 'Expired',
        notes: 'Unclaimed prior to expiry limit.',
      },
    ];

    await Donation.insertMany(sampleDonations);
    console.log(`Seeded ${sampleDonations.length} sample food donation posts.`);

    console.log('\n--- SEEDING COMPLETED SUCCESSFULLY ---');
    console.log('Sample Accounts Created:');
    console.log('1. Admin: admin@foodshare.org / Admin@123');
    console.log('2. Donor: bistro@foodshare.org / Donor@123');
    console.log('3. Donor: grandhotel@foodshare.org / Donor@123');
    console.log('4. NGO: hopefoodbank@foodshare.org / Ngo@123');
    console.log('5. NGO: cityshelter@foodshare.org / Ngo@123');
    console.log('----------------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
