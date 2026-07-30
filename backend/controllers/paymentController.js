const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const ActiveLease = require('../models/ActiveLease');
const Settings = require('../models/Settings');
const { asyncHandler } = require('../utils/helpers');
const { createNotification } = require('../utils/notify');

/*
 * DEMO PAYMENT FLOW
 * -----------------
 * This mirrors how a real gateway (Stripe / Razorpay) integration works so you
 * can swap in the real SDK later with minimal changes.
 *
 * 1) POST /api/payments/create-intent
 *    - Client sends leaseId.
 *    - Server creates a "pending" Transaction and returns an order object
 *      (demo order id + amount). With Stripe this is a PaymentIntent; with
 *      Razorpay this is an Order.
 *
 * 2) Client "pays" (in demo, immediately calls verify).
 *
 * 3) POST /api/payments/verify
 *    - Client sends transactionId (+ gateway signature fields in real mode).
 *    - Server marks the Transaction "success", flags the lease as paid, and
 *      notifies both parties. In real mode you'd verify the gateway signature
 *      here before marking success.
 */

// POST /api/payments/create-intent  (seeker)
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

  // Create a pending transaction record
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
    order: {
      id: demoOrderId,
      amount: lease.rentAmount,
      currency: 'INR',
      mode: 'demo',
    },
    // When you connect a real gateway, return the client_secret / order details here.
  });
});

// POST /api/payments/verify  (seeker)
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
   * REAL GATEWAY: verify the signature here, e.g. for Razorpay:
   *   const expected = crypto.createHmac('sha256', KEY_SECRET)
   *     .update(order_id + '|' + payment_id).digest('hex');
   *   if (expected !== signature) -> mark failed / throw
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

    // Flag the lease as paid
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

// GET /api/payments/history  (seeker)
const getPaymentHistory = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ payerId: req.user._id })
    .populate('receiverId', 'fullName email')
    .populate({
      path: 'leaseId',
      populate: { path: 'landId', select: 'title location' },
    })
    .sort('-createdAt');
  res.json(transactions);
});

// GET /api/payments/earnings  (owner)
const getEarnings = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({
    receiverId: req.user._id,
  })
    .populate('payerId', 'fullName email')
    .populate({
      path: 'leaseId',
      populate: { path: 'landId', select: 'title location' },
    })
    .sort('-createdAt');

  const totalEarnings = transactions
    .filter((t) => t.status === 'success')
    .reduce((sum, t) => sum + (t.netOwnerAmount != null ? t.netOwnerAmount : t.amount), 0);

  res.json({
    totalEarnings,
    successfulPayments: transactions.filter((t) => t.status === 'success').length,
    transactions,
  });
});

module.exports = {
  createPaymentIntent,
  verifyPayment,
  getPaymentHistory,
  getEarnings,
};

