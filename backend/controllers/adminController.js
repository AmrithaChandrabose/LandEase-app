const User = require('../models/User');
const Land = require('../models/Land');
const ActiveLease = require('../models/ActiveLease');
const Transaction = require('../models/Transaction');
const { asyncHandler } = require('../utils/helpers');

// GET /api/admin/stats  - core dashboard counters
const getStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalOwners, totalSeekers, totalLands, availableLands, leasedLands, activeLeases, revenueAgg,] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'owner' }),
    User.countDocuments({ role: 'user' }),
    Land.countDocuments(),
    Land.countDocuments({ status: 'available' }),
    Land.countDocuments({ status: 'leased' }),
    ActiveLease.countDocuments({ status: 'active' }),
    Transaction.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$commissionAmount', 0] } } } },
    ]),
  ]);

  res.json({
    users: { total: totalUsers, owners: totalOwners, seekers: totalSeekers },
    lands: { total: totalLands, available: availableLands, leased: leasedLands },
    activeLeases,
    revenue: revenueAgg[0] ? revenueAgg[0].total : 0,
  });
});

// GET /api/admin/dashboard  - stats + recent activity for the landing screen
const getDashboard = asyncHandler(async (req, res) => {
  const [totalUsers, totalLands, activeLeases, revenueAgg, recentUsers, recentLands, recentTransactions,
  ] = await Promise.all([
    User.countDocuments(),
    Land.countDocuments(),
    ActiveLease.countDocuments({ status: 'active' }),
    Transaction.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$commissionAmount', 0] } } } },
    ]),
    User.find().sort('-createdAt').limit(5).select('fullName email role createdAt'),
    Land.find().sort('-createdAt').limit(5).populate('ownerId', 'fullName'),
    Transaction.find()
      .sort('-createdAt')
      .limit(5)
      .populate('payerId', 'fullName')
      .populate('receiverId', 'fullName'),
  ]);

  res.json({
    stats: {
      totalUsers,
      totalLands,
      activeLeases,
      revenue: revenueAgg[0] ? revenueAgg[0].total : 0,
    },
    recent: {
      users: recentUsers,
      lands: recentLands,
      transactions: recentTransactions,
    },
  });
});

module.exports = { getStats, getDashboard };
