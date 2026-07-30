const mongoose = require('mongoose');

const landSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    location: { type: String, required: true }, // e.g., "Thrissur, Kerala"

    // Display string + normalized number for querying/sorting
    area: { type: String, required: true }, // e.g., "2 acre"
    areaInAcres: { type: Number, default: 0 },

    minLeaseDuration: { type: String, required: true }, // e.g., "12 mo min"
    minLeaseDurationInMonths: { type: Number, default: 0 },

    price: { type: Number, required: true }, // lease price
    images: [{ type: String }], // Array of image URLs
    status: {
      type: String,
      enum: ['available', 'leased', 'unavailable'],
      default: 'available',
    },
  },
  { timestamps: true }
);

landSchema.index({ location: 1, price: 1, areaInAcres: 1 });

module.exports = mongoose.model('Land', landSchema);
