const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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
 * STRIPE PAYMENT FLOW (seeker side)
 *   1) POST /api/user/payments/create-intent  { leaseId }  -> pending transaction + Stripe Session URL
 *   2) POST /api/user/payments/verify         { transactionId, success, stripeSessionId } -> retrieve & verify session, lease paid
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

  const lease = await ActiveLease.findById(leaseId).populate('landId');
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

  // Create a pending transaction record
  const transaction = await Transaction.create({
    leaseId: lease._id,
    payerId: lease.seekerId,
    receiverId: lease.ownerId,
    amount: lease.rentAmount,
    paymentMethod: 'card',
    transactionReference: 'pending_session',
    gatewayOrderId: 'pending_session',
    isDemo: false,
    status: 'pending',
  });

  // Create Stripe Checkout Session
  const lineItems = [
    {
      price_data: {
        currency: 'inr',
        product_data: {
          name: `Rent for ${lease.landId?.title || 'Land Listing'}`,
          description: `Location: ${lease.landId?.location || 'N/A'}. Rent amount: ₹${lease.rentAmount}/month.`,
        },
        unit_amount: Math.round(lease.rentAmount * 100),
      },
      quantity: 1,
    },
  ];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}&transactionId=${transaction._id}`,
    cancel_url: `http://localhost:5173/payment-error?transactionId=${transaction._id}`,
    line_items: lineItems,
    customer_email: req.user.email,
  });

  // Update transaction with actual Stripe Session ID
  transaction.transactionReference = session.id;
  transaction.gatewayOrderId = session.id;
  await transaction.save();

  res.status(201).json({
    message: 'Stripe payment session created.',
    transactionId: transaction._id,
    order: {
      id: session.id,
      amount: lease.rentAmount,
      currency: 'INR',
      mode: 'stripe',
      url: session.url,
    },
  });
});

// POST /api/user/payments/verify  - step 2
const verifyPayment = asyncHandler(async (req, res) => {
  const { transactionId, success = true, stripeSessionId } = req.body;
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

  let paymentSuccess = success;
  let gatewayPaymentId = '';

  if (success && stripeSessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
      if (session.payment_status === 'paid') {
        paymentSuccess = true;
        gatewayPaymentId = session.payment_intent || stripeSessionId;
      } else {
        paymentSuccess = false;
      }
    } catch (err) {
      res.status(400);
      throw new Error('Stripe session retrieval failed: ' + err.message);
    }
  }

  if (paymentSuccess) {
    const lease = await ActiveLease.findById(transaction.leaseId);
    const settings = await Settings.getSettings();

    // Charge commission only on the FIRST rent payment
    const paidCount = lease ? (lease.paidMonthsCount || 0) : 0;
    const commissionPercent = (paidCount === 0) ? (settings.platform?.commissionPercent || 0) : 0;
    const commissionAmount = Math.round((transaction.amount * commissionPercent) / 100 * 100) / 100;
    const netOwnerAmount = transaction.amount - commissionAmount;

    transaction.status = 'success';
    transaction.gatewayPaymentId = gatewayPaymentId;
    transaction.paymentMethod = 'card';
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

  const populatedTransaction = await Transaction.findById(transaction._id)
    .populate('receiverId', 'fullName email')
    .populate({
      path: 'leaseId',
      populate: { path: 'landId', select: 'title location' },
    });

  res.json({
    message: paymentSuccess ? 'Payment successful' : 'Payment failed',
    transaction: populatedTransaction || transaction,
  });
});

module.exports = {
  getSpendingSummary,
  getPayments,
  getPaymentById,
  createPaymentIntent,
  verifyPayment,
};
