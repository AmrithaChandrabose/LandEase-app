const LeaseRequest = require('../models/LeaseRequest');
const ActiveLease = require('../models/ActiveLease');
const Transaction = require('../models/Transaction');
const { asyncHandler } = require('../utils/helpers');

// GET /api/user/dashboard/stats  - overview counters for the seeker
const getDashboardStats = asyncHandler(async (req, res) => {
  const seekerId = req.user._id;

  const [
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    activeLeases,
    completedLeases,
    unpaidLeases,
    spentAgg,
  ] = await Promise.all([
    LeaseRequest.countDocuments({ seekerId, status: 'pending' }),
    LeaseRequest.countDocuments({ seekerId, status: 'approved' }),
    LeaseRequest.countDocuments({ seekerId, status: 'rejected' }),
    ActiveLease.countDocuments({ seekerId, status: 'active' }),
    ActiveLease.countDocuments({ seekerId, status: 'completed' }),
    ActiveLease.countDocuments({ seekerId, status: 'active', isPaid: false }),
    Transaction.aggregate([
      { $match: { payerId: seekerId, status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
  ]);

  res.json({
    requests: {
      pending: pendingRequests,
      approved: approvedRequests,
      rejected: rejectedRequests,
    },
    leases: {
      active: activeLeases,
      completed: completedLeases,
      unpaid: unpaidLeases,
    },
    spending: {
      total: spentAgg[0] ? spentAgg[0].total : 0,
      payments: spentAgg[0] ? spentAgg[0].count : 0,
    },
  });
});

// GET /api/user/dashboard  - stats + recent activity for the landing screen
const getDashboard = asyncHandler(async (req, res) => {
  const seekerId = req.user._id;

  const [
    pendingRequests,
    activeLeases,
    unpaidLeases,
    spentAgg,
    recentRequests,
    recentLeases,
    recentTransactions,
  ] = await Promise.all([
    LeaseRequest.countDocuments({ seekerId, status: 'pending' }),
    ActiveLease.countDocuments({ seekerId, status: 'active' }),
    ActiveLease.countDocuments({ seekerId, status: 'active', isPaid: false }),
    Transaction.aggregate([
      { $match: { payerId: seekerId, status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    LeaseRequest.find({ seekerId })
      .sort('-createdAt')
      .limit(5)
      .populate('landId', 'title location price')
      .populate('ownerId', 'fullName'),
    ActiveLease.find({ seekerId })
      .sort('-createdAt')
      .limit(5)
      .populate('landId', 'title location')
      .populate('ownerId', 'fullName'),
    Transaction.find({ payerId: seekerId })
      .sort('-createdAt')
      .limit(5)
      .populate('receiverId', 'fullName'),
  ]);

  res.json({
    stats: {
      pendingRequests,
      activeLeases,
      unpaidLeases,
      totalSpent: spentAgg[0] ? spentAgg[0].total : 0,
    },
    recent: {
      requests: recentRequests,
      leases: recentLeases,
      transactions: recentTransactions,
    },
  });
});

module.exports = { getDashboardStats, getDashboard };
