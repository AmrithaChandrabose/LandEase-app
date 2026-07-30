/*
 * Seed script — creates demo admin, owner, seeker and sample lands.
 * Run with: npm run seed
 * WARNING: this clears existing Users, Lands, LeaseRequests, ActiveLeases,
 * Transactions and Notifications.
 */
require('dotenv').config();
const connectDB = require('../config/db');
const mongoose = require('mongoose');

const User = require('../models/User');
const Land = require('../models/Land');
const LeaseRequest = require('../models/LeaseRequest');
const ActiveLease = require('../models/ActiveLease');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const Settings = require('../models/Settings');
const { parseLeadingNumber } = require('./helpers');

const run = async () => {
  await connectDB();

  console.log('Clearing collections...');
  await Promise.all([
    User.deleteMany({}),
    Land.deleteMany({}),
    LeaseRequest.deleteMany({}),
    ActiveLease.deleteMany({}),
    Transaction.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log('Creating users...');
  const admin = await User.create({
    fullName: 'Platform Admin',
    email: 'admin@landease.com',
    phone: '9000000000',
    password: 'admin123',
    role: 'admin',
  });

  const owner = await User.create({
    fullName: 'Ravi Owner',
    email: 'owner@landease.com',
    phone: '9000000001',
    password: 'owner123',
    role: 'owner',
  });

  const seeker = await User.create({
    fullName: 'Anu Seeker',
    email: 'seeker@landease.com',
    phone: '9000000002',
    password: 'seeker123',
    role: 'user',
  });

  console.log('Initializing platform settings...');
  await Settings.deleteMany({});
  await Settings.getSettings(); // creates the default settings document

  console.log('Creating lands...');
  const sampleLands = [
    {
      title: 'Fertile Paddy Field',
      description: 'Well-irrigated paddy field near the river.',
      location: 'Thrissur, Kerala',
      area: '2 acre',
      minLeaseDuration: '12 mo min',
      price: 15000,
      images: [],
    },
    {
      title: 'Rubber Plantation Plot',
      description: 'Mature rubber trees, ready for tapping.',
      location: 'Kottayam, Kerala',
      area: '5 acre',
      minLeaseDuration: '24 mo min',
      price: 40000,
      images: [],
    },
    {
      title: 'Open Farmland',
      description: 'Flat open land suitable for vegetables.',
      location: 'Palakkad, Kerala',
      area: '3 acre',
      minLeaseDuration: '6 mo min',
      price: 20000,
      images: [],
    },
  ];

  for (const l of sampleLands) {
    await Land.create({
      ownerId: owner._id,
      ...l,
      areaInAcres: parseLeadingNumber(l.area),
      minLeaseDurationInMonths: parseLeadingNumber(l.minLeaseDuration),
    });
  }

  console.log('\nSeed complete. Demo accounts:');
  console.log('  Admin  -> admin@landease.com  / admin123');
  console.log('  Owner  -> owner@landease.com  / owner123');
  console.log('  Seeker -> seeker@landease.com / seeker123');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
