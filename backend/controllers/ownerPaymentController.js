const Transaction = require('../models/Transaction');
const ActiveLease = require('../models/ActiveLease');
const {
  asyncHandler,
  getPagination,
  paginatedResponse,
} = require('../utils/helpers');

// GET /api/owner/payments/summary  - earnings overview
const getEarningsSummary = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;

  const [successAgg, pendingAgg, failedCount] = await Promise.all([
    Transaction.aggregate([
      { $match: { receiverId: ownerId, status: 'success' } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$netOwnerAmount', '$amount'] } }, count: { $sum: 1 } } },
    ]),
    Transaction.aggregate([
      { $match: { receiverId: ownerId, status: 'pending' } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$netOwnerAmount', '$amount'] } }, count: { $sum: 1 } } },
    ]),
    Transaction.countDocuments({ receiverId: ownerId, status: 'failed' }),
  ]);

  res.json({
    totalEarnings: successAgg[0] ? successAgg[0].total : 0,
    successfulPayments: successAgg[0] ? successAgg[0].count : 0,
    pendingAmount: pendingAgg[0] ? pendingAgg[0].total : 0,
    pendingPayments: pendingAgg[0] ? pendingAgg[0].count : 0,
    failedPayments: failedCount,
  });
});

// GET /api/owner/payments  - transaction history (paginated)
// Query: status, method, from, to, page, limit, sort
const getPayments = asyncHandler(async (req, res) => {
  const { status, method, from, to, sort = '-createdAt' } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = { receiverId: req.user._id };
  if (status) filter.status = status;
  if (method) filter.paymentMethod = method;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const [transactions, total, sumAgg] = await Promise.all([
    Transaction.find(filter)
      .populate('payerId', 'fullName email')
      .populate({
        path: 'leaseId',
        populate: { path: 'landId', select: 'title location' },
      })
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments(filter),
    Transaction.aggregate([
      { $match: { ...filter, status: 'success' } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$netOwnerAmount', '$amount'] } } } },
    ]),
  ]);

  const response = paginatedResponse(transactions, total, page, limit);
  response.totalSuccessAmount = sumAgg[0] ? sumAgg[0].total : 0;
  res.json(response);
});

// GET /api/owner/payments/:id
const getPaymentById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('payerId', 'fullName email phone')
    .populate({
      path: 'leaseId',
      populate: { path: 'landId', select: 'title location price' },
    });
  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }
  if (transaction.receiverId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this transaction');
  }
  res.json(transaction);
});

// GET /api/owner/payments/lease/:leaseId  - payment status for one lease
const getPaymentsForLease = asyncHandler(async (req, res) => {
  const lease = await ActiveLease.findById(req.params.leaseId);
  if (!lease) {
    res.status(404);
    throw new Error('Lease not found');
  }
  if (lease.ownerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this lease');
  }

  const transactions = await Transaction.find({ leaseId: lease._id })
    .populate('payerId', 'fullName email')
    .sort('-createdAt');

  res.json({
    leaseId: lease._id,
    isPaid: lease.isPaid,
    rentAmount: lease.rentAmount,
    transactions,
  });
});

// GET /api/owner/payments/export  - CSV of the owner's received transactions
const exportPaymentsCsv = asyncHandler(async (req, res) => {
  const { from, to, status } = req.query;
  const filter = { receiverId: req.user._id };
  if (status) filter.status = status;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const transactions = await Transaction.find(filter)
    .populate('payerId', 'fullName email')
    .sort('-createdAt');

  const header = [
    'TransactionID',
    'Date',
    'Payer',
    'PayerEmail',
    'GrossAmount',
    'CommissionPercent',
    'CommissionAmount',
    'NetPayout',
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
  res.setHeader('Content-Disposition', 'attachment; filename="my-earnings.csv"');
  res.send(csv);
});

module.exports = {
  getEarningsSummary,
  getPayments,
  getPaymentById,
  getPaymentsForLease,
  exportPaymentsCsv,
};
