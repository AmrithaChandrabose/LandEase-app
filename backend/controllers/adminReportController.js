const User = require('../models/User');
const Land = require('../models/Land');
const ActiveLease = require('../models/ActiveLease');
const Transaction = require('../models/Transaction');
const { asyncHandler } = require('../utils/helpers');

// Helper: resolve a date range from query (?from=&to=), defaulting to last 12 months
const resolveRange = (query) => {
  const to = query.to ? new Date(query.to) : new Date();
  const from = query.from
    ? new Date(query.from)
    : new Date(new Date().setMonth(new Date().getMonth() - 11));
  return { from, to };
};

// GET /api/admin/reports/summary  - high level KPIs
const getSummaryReport = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    owners,
    seekers,
    blockedUsers,
    totalLands,
    availableLands,
    leasedLands,
    activeLeases,
    completedLeases,
    revenueAgg,
    pendingPayments,
    failedPayments,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'owner' }),
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ isActive: false }),
    Land.countDocuments(),
    Land.countDocuments({ status: 'available' }),
    Land.countDocuments({ status: 'leased' }),
    ActiveLease.countDocuments({ status: 'active' }),
    ActiveLease.countDocuments({ status: 'completed' }),
    Transaction.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$commissionAmount', 0] } }, count: { $sum: 1 } } },
    ]),
    Transaction.countDocuments({ status: 'pending' }),
    Transaction.countDocuments({ status: 'failed' }),
  ]);

  const revenue = revenueAgg[0] ? revenueAgg[0].total : 0;
  const successfulPayments = revenueAgg[0] ? revenueAgg[0].count : 0;

  res.json({
    users: { total: totalUsers, owners, seekers, blocked: blockedUsers },
    lands: { total: totalLands, available: availableLands, leased: leasedLands },
    leases: { active: activeLeases, completed: completedLeases },
    payments: {
      revenue,
      successfulPayments,
      pending: pendingPayments,
      failed: failedPayments,
    },
  });
});

// GET /api/admin/reports/revenue?from=&to=&groupBy=month|day
// Revenue time series from successful transactions
const getRevenueReport = asyncHandler(async (req, res) => {
  const { from, to } = resolveRange(req.query);
  const groupBy = req.query.groupBy === 'day' ? 'day' : 'month';

  const dateFormat = groupBy === 'day' ? '%Y-%m-%d' : '%Y-%m';

  const series = await Transaction.aggregate([
    { $match: { status: 'success', createdAt: { $gte: from, $lte: to } } },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
        total: { $sum: { $ifNull: ['$commissionAmount', 0] } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const grandTotal = series.reduce((sum, p) => sum + p.total, 0);

  res.json({
    from,
    to,
    groupBy,
    grandTotal,
    series: series.map((p) => ({
      period: p._id,
      total: p.total,
      transactions: p.count,
    })),
  });
});

// GET /api/admin/reports/users?from=&to=&groupBy=month|day
// New user registrations over time
const getUserGrowthReport = asyncHandler(async (req, res) => {
  const { from, to } = resolveRange(req.query);
  const groupBy = req.query.groupBy === 'day' ? 'day' : 'month';
  const dateFormat = groupBy === 'day' ? '%Y-%m-%d' : '%Y-%m';

  const series = await User.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to } } },
    {
      $group: {
        _id: {
          period: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          role: '$role',
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.period': 1 } },
  ]);

  // Reshape into { period, user, owner, admin, total }
  const map = {};
  series.forEach((p) => {
    const period = p._id.period;
    if (!map[period]) map[period] = { period, user: 0, owner: 0, admin: 0, total: 0 };
    map[period][p._id.role] = p.count;
    map[period].total += p.count;
  });

  res.json({ from, to, groupBy, series: Object.values(map) });
});

// GET /api/admin/reports/lands
// Breakdown of lands by status and by location
const getLandsReport = asyncHandler(async (req, res) => {
  const [byStatus, byLocation] = await Promise.all([
    Land.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Land.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]),
  ]);

  res.json({
    byStatus: byStatus.map((s) => ({ status: s._id, count: s.count })),
    byLocation: byLocation.map((l) => ({
      location: l._id,
      count: l.count,
      avgPrice: Math.round(l.avgPrice || 0),
    })),
  });
});

// GET /api/admin/reports/top-owners?limit=10
// Owners ranked by earnings (successful transactions received)
const getTopOwnersReport = asyncHandler(async (req, res) => {
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 10);

  const rows = await Transaction.aggregate([
    { $match: { status: 'success' } },
    {
      $group: {
        _id: '$receiverId',
        earnings: { $sum: { $ifNull: ['$netOwnerAmount', '$amount'] } },
        payments: { $sum: 1 },
      },
    },
    { $sort: { earnings: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'owner',
      },
    },
    { $unwind: '$owner' },
    {
      $project: {
        _id: 0,
        ownerId: '$_id',
        fullName: '$owner.fullName',
        email: '$owner.email',
        earnings: 1,
        payments: 1,
      },
    },
  ]);

  res.json({ data: rows });
});

// GET /api/admin/reports/export/transactions?from=&to=&status=
// CSV export of transactions
const exportTransactionsCsv = asyncHandler(async (req, res) => {
  const { from, to, status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const transactions = await Transaction.find(filter)
    .populate('payerId', 'fullName email')
    .populate('receiverId', 'fullName email')
    .sort('-createdAt');

  const header = [
    'TransactionID',
    'Date',
    'Payer',
    'PayerEmail',
    'Receiver',
    'ReceiverEmail',
    'GrossAmount',
    'CommissionPercent',
    'CommissionAmount',
    'NetPayoutToOwner',
    'Method',
    'Status',
    'Reference',
  ];

  const escape = (v) => {
    const s = String(v == null ? '' : v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };

  const rows = transactions.map((t) =>
    [
      t._id,
      t.createdAt.toISOString(),
      t.payerId ? t.payerId.fullName : '',
      t.payerId ? t.payerId.email : '',
      t.receiverId ? t.receiverId.fullName : '',
      t.receiverId ? t.receiverId.email : '',
      t.amount,
      t.commissionPercent || 0,
      t.commissionAmount || 0,
      t.netOwnerAmount != null ? t.netOwnerAmount : t.amount,
      t.paymentMethod,
      t.status,
      t.transactionReference,
    ]
      .map(escape)
      .join(',')
  );

  const csv = [header.join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="transactions.csv"'
  );
  res.send(csv);
});

module.exports = {
  getSummaryReport,
  getRevenueReport,
  getUserGrowthReport,
  getLandsReport,
  getTopOwnersReport,
  exportTransactionsCsv,
};
