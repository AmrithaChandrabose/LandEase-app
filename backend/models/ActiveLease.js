const mongoose = require('mongoose');

const activeLeaseSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LeaseRequest',
      required: true,
    },
    landId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Land',
      required: true,
    },
    seekerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    rentAmount: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    nextPaymentDueDate: { type: Date },
    paidMonthsCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'completed', 'terminated'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActiveLease', activeLeaseSchema);
