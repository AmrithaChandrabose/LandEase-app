const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    leaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ActiveLease',
      required: true,
    },
    payerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'demo' }, // 'card', 'upi', 'bank_transfer', 'demo'
    transactionReference: { type: String, required: true }, // Gateway ID / demo ref
    // Extra fields useful when a real gateway is connected later
    gatewayOrderId: { type: String, default: '' },
    gatewayPaymentId: { type: String, default: '' },
    isDemo: { type: Boolean, default: true },
    commissionPercent: { type: Number, default: 0 },
    commissionAmount: { type: Number, default: 0 },
    netOwnerAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
