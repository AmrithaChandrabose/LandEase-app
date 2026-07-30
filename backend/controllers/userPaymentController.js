const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const ActiveLease = require('../models/ActiveLease');
const Settings = require('../models/Settings');
const {
  asyncHandler,
  getPagination,
  paginatedResponse,
} = require('../utils/helpers');
const { createNotification } = require('../utils/notify');

/*
 * DEMO PAYMENT FLOW (seeker side)
 *   1) POST /api/user/payments/create-intent  { leaseId }  -> pending transaction + demo order
 *   2) POST /api/user/payments/verify         { transactionId, success } -> marks success, lease paid
 * Mirrors a real gateway so Stripe/Razorpay can slot in later (see REAL GATEWAY notes).
 */

// GET /api/user/payments/summary  - spending overview
const getSpendingSummary = asyncHandler(async (req, res) => {
  const seekerId = req.user._id;

  const [successAgg, pendingAgg, failedCount] = await Promise.all([
    Transaction.aggregate([
      { $match: { payerId: seekerId, status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Transaction.aggregate([
      { $match: { payerId: seekerId, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Transaction.countDocuments({ payerId: seekerId, status: 'failed' }),
  ]);

  res.json({
    totalSpent: successAgg[0] ? successAgg[0].total : 0,
    successfulPayments: successAgg[0] ? successAgg[0].count : 0,
    pendingAmount: pendingAgg[0] ? pendingAgg[0].total : 0,
    pendingPayments: pendingAgg[0] ? pendingAgg[0].count : 0,
    failedPayments: failedCount,
  });
});

// GET /api/user/payments  - payment history (paginated)
// Query: status, method, from, to, page, limit, sort
const getPayments = asyncHandler(async (req, res) => {
  const { status, method, from, to, sort = '-createdAt' } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = { payerId: req.user._id };
  if (status) filter.status = status;
  if (method) filter.paymentMethod = method;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate('receiverId', 'fullName email')
      .populate({
        path: 'leaseId',
        populate: { path: 'landId', select: 'title location' },
      })
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments(filter),
  ]);

  res.json(paginatedResponse(transactions, total, page, limit));
});

// GET /api/user/payments/:id
const getPaymentById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('receiverId', 'fullName email phone')
    .populate({
      path: 'leaseId',
      populate: { path: 'landId', select: 'title location price' },
    });
  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }
  if (transaction.payerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this transaction');
  }
  res.json(transaction);
});

// POST /api/user/payments/create-intent  - step 1
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { leaseId } = req.body;
  if (!leaseId) {
    res.status(400);
    throw new Error('leaseId is required');
  }

  const lease = await ActiveLease.findById(leaseId);
  if (!lease) {
    res.status(404);
    throw new Error('Lease not found');
  }
  if (lease.seekerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to pay for this lease');
  }
  if (lease.isPaid) {
    res.status(400);
    throw new Error('This lease is already paid');
  }

  const demoOrderId = 'demo_order_' + crypto.randomBytes(8).toString('hex');

  const transaction = await Transaction.create({
    leaseId: lease._id,
    payerId: lease.seekerId,
    receiverId: lease.ownerId,
    amount: lease.rentAmount,
    paymentMethod: 'demo',
    transactionReference: demoOrderId,
    gatewayOrderId: demoOrderId,
    isDemo: true,
    status: 'pending',
  });

  res.status(201).json({
    message: 'Demo payment intent created. Call /verify to complete.',
    transactionId: transaction._id,
    order: { id: demoOrderId, amount: lease.rentAmount, currency: 'INR', mode: 'demo' },
    // REAL GATEWAY: return the client_secret / order details here.
  });
});

// POST /api/user/payments/verify  - step 2
const verifyPayment = asyncHandler(async (req, res) => {
  const { transactionId, success = true, paymentMethod } = req.body;
  if (!transactionId) {
    res.status(400);
    throw new Error('transactionId is required');
  }

  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }
  if (transaction.payerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to verify this transaction');
  }
  if (transaction.status !== 'pending') {
    res.status(400);
    throw new Error(`Transaction already ${transaction.status}`);
  }

  /*
   * REAL GATEWAY: verify the gateway signature here before marking success.
   */

  const demoPaymentId = 'demo_pay_' + crypto.randomBytes(8).toString('hex');

  if (success) {
    const lease = await ActiveLease.findById(transaction.leaseId);
    const settings = await Settings.getSettings();

    // Charge commission only on the FIRST rent payment
    const paidCount = lease ? (lease.paidMonthsCount || 0) : 0;
    const commissionPercent = (paidCount === 0) ? (settings.platform?.commissionPercent || 0) : 0;
    const commissionAmount = Math.round((transaction.amount * commissionPercent) / 100 * 100) / 100;
    const netOwnerAmount = transaction.amount - commissionAmount;

    transaction.status = 'success';
    transaction.gatewayPaymentId = demoPaymentId;
    if (paymentMethod) transaction.paymentMethod = paymentMethod;
    transaction.commissionPercent = commissionPercent;
    transaction.commissionAmount = commissionAmount;
    transaction.netOwnerAmount = netOwnerAmount;
    await transaction.save();

    if (lease) {
      lease.paidMonthsCount = paidCount + 1;
      const currentDueDate = lease.nextPaymentDueDate ? new Date(lease.nextPaymentDueDate) : new Date(lease.startDate);
      currentDueDate.setMonth(currentDueDate.getMonth() + 1);
      lease.nextPaymentDueDate = currentDueDate;
      lease.isPaid = true;
      await lease.save();
    }

    await createNotification({
      userId: transaction.receiverId,
      title: 'Payment Received',
      message: `You received a payment of ${transaction.amount}.`,
      type: 'payment',
    });
    await createNotification({
      userId: transaction.payerId,
      title: 'Payment Successful',
      message: `Your payment of ${transaction.amount} was successful.`,
      type: 'payment',
    });
  } else {
    transaction.status = 'failed';
    await transaction.save();
  }

  res.json({
    message: success ? 'Payment successful (demo)' : 'Payment failed (demo)',
    transaction,
  });
});

module.exports = {
  getSpendingSummary,
  getPayments,
  getPaymentById,
  createPaymentIntent,
  verifyPayment,
};
