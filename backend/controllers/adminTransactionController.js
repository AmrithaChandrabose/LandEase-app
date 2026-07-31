const Transaction = require('../models/Transaction');
const ActiveLease = require('../models/ActiveLease');
const {
  asyncHandler,
  getPagination,
  paginatedResponse,
} = require('../utils/helpers');

// GET /api/admin/transactions
// Query: status, payerId, receiverId, method, from, to, search, page, limit, sort
const getAllTransactions = asyncHandler(async (req, res) => {
  const {
    status,
    payerId,
    receiverId,
    method,
    from,
    to,
    sort = '-createdAt',
  } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = {};
  if (status) filter.status = status;
  if (payerId) filter.payerId = payerId;
  if (receiverId) filter.receiverId = receiverId;
  if (method) filter.paymentMethod = method;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const [transactions, total, sumAgg] = await Promise.all([
    Transaction.find(filter)
      .populate('payerId', 'fullName email')
      .populate('receiverId', 'fullName email')
      .populate({
        path: 'leaseId',
        populate: { path: 'landId', select: 'title location' }
      })
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments(filter),
    Transaction.aggregate([
      { $match: { ...filter, status: 'success' } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$commissionAmount', 0] } } } },
    ]),
  ]);

  const response = paginatedResponse(transactions, total, page, limit);
  response.totalSuccessAmount = sumAgg[0] ? sumAgg[0].total : 0;
  res.json(response);
});

// GET /api/admin/transactions/:id
const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('payerId', 'fullName email phone')
    .populate('receiverId', 'fullName email phone')
    .populate({
      path: 'leaseId',
      populate: { path: 'landId', select: 'title location price' },
    });
  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }
  res.json(transaction);
});

// PUT /api/admin/transactions/:id/status  - manual reconciliation
const updateTransactionStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'success', 'failed'].includes(status)) {
    res.status(400);
    throw new Error("status must be 'pending', 'success' or 'failed'");
  }
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  transaction.status = status;
  await transaction.save();

  // Keep the lease's paid flag in sync when admin marks success
  if (status === 'success') {
    await ActiveLease.findByIdAndUpdate(transaction.leaseId, { isPaid: true });
  }

  res.json({ _id: transaction._id, status: transaction.status });
});

module.exports = {
  getAllTransactions,
  getTransactionById,
  updateTransactionStatus,
};
