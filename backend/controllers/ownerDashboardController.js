const Land = require('../models/Land');
const LeaseRequest = require('../models/LeaseRequest');
const ActiveLease = require('../models/ActiveLease');
const Transaction = require('../models/Transaction');
const { asyncHandler } = require('../utils/helpers');

// GET /api/owner/dashboard/stats  - overview counters for the owner
const getDashboardStats = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;

  const [
    totalLands,
    availableLands,
    leasedLands,
    unavailableLands,
    pendingRequests,
    activeLeases,
    completedLeases,
    earningsAgg,
    pendingPaymentsAgg,
  ] = await Promise.all([
    Land.countDocuments({ ownerId }),
    Land.countDocuments({ ownerId, status: 'available' }),
    Land.countDocuments({ ownerId, status: 'leased' }),
    Land.countDocuments({ ownerId, status: 'unavailable' }),
    LeaseRequest.countDocuments({ ownerId, status: 'pending' }),
    ActiveLease.countDocuments({ ownerId, status: 'active' }),
    ActiveLease.countDocuments({ ownerId, status: 'completed' }),
    Transaction.aggregate([
      { $match: { receiverId: ownerId, status: 'success' } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$netOwnerAmount', '$amount'] } }, count: { $sum: 1 } } },
    ]),
    Transaction.aggregate([
      { $match: { receiverId: ownerId, status: 'pending' } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$netOwnerAmount', '$amount'] } }, count: { $sum: 1 } } },
    ]),
  ]);

  res.json({
    lands: {
      total: totalLands,
      available: availableLands,
      leased: leasedLands,
      unavailable: unavailableLands,
    },
    requests: { pending: pendingRequests },
    leases: { active: activeLeases, completed: completedLeases },
    earnings: {
      total: earningsAgg[0] ? earningsAgg[0].total : 0,
      successfulPayments: earningsAgg[0] ? earningsAgg[0].count : 0,
      pending: pendingPaymentsAgg[0] ? pendingPaymentsAgg[0].total : 0,
    },
  });
});

// GET /api/owner/dashboard  - stats + recent activity for the landing screen
const getDashboard = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;

  const [
    totalLands,
    leasedLands,
    pendingRequests,
    activeLeases,
    earningsAgg,
    recentRequests,
    recentLeases,
    recentTransactions,
  ] = await Promise.all([
    Land.countDocuments({ ownerId }),
    Land.countDocuments({ ownerId, status: 'leased' }),
    LeaseRequest.countDocuments({ ownerId, status: 'pending' }),
    ActiveLease.countDocuments({ ownerId, status: 'active' }),
    Transaction.aggregate([
      { $match: { receiverId: ownerId, status: 'success' } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$netOwnerAmount', '$amount'] } } } },
    ]),
    LeaseRequest.find({ ownerId })
      .sort('-createdAt')
      .limit(5)
      .populate('landId', 'title location')
      .populate('seekerId', 'fullName'),
    ActiveLease.find({ ownerId })
      .sort('-createdAt')
      .limit(5)
      .populate('landId', 'title location')
      .populate('seekerId', 'fullName'),
    Transaction.find({ receiverId: ownerId })
      .sort('-createdAt')
      .limit(5)
      .populate('payerId', 'fullName'),
  ]);

  res.json({
    stats: {
      totalLands,
      leasedLands,
      pendingRequests,
      activeLeases,
      earnings: earningsAgg[0] ? earningsAgg[0].total : 0,
    },
    recent: {
      requests: recentRequests,
      leases: recentLeases,
      transactions: recentTransactions,
    },
  });
});

module.exports = { getDashboardStats, getDashboard };
