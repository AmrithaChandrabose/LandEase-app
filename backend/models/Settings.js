const mongoose = require('mongoose');

/*
 * Settings is a SINGLETON document (only one row ever exists).
 * Use Settings.getSettings() to fetch-or-create it.
 * Grouped into: general, ui, platform, payment, notifications.
 */
const settingsSchema = new mongoose.Schema(
  {
    // Fixed key so we always upsert the same single document
    key: { type: String, default: 'global', unique: true },

    // ---- General / branding ----
    general: {
      siteName: { type: String, default: 'LandEase' },
      supportEmail: { type: String, default: 'support@landease.com' },
      supportPhone: { type: String, default: '' },
      currency: { type: String, default: 'INR' },
      currencySymbol: { type: String, default: '₹' },
      maintenanceMode: { type: Boolean, default: false },
      maintenanceMessage: {
        type: String,
        default: 'We are performing scheduled maintenance. Please check back soon.',
      },
    },

    // ---- UI / theme (consumed by frontend) ----
    ui: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
      primaryColor: { type: String, default: '#2e7d32' },
      accentColor: { type: String, default: '#ff9800' },
      logoUrl: { type: String, default: '' },
      faviconUrl: { type: String, default: '' },
      itemsPerPage: { type: Number, default: 20 },
      dateFormat: { type: String, default: 'DD MMM YYYY' },
      showFeaturedLands: { type: Boolean, default: true },
      bannerText: { type: String, default: '' },
    },

    // ---- Platform rules ----
    platform: {
      allowRegistration: { type: Boolean, default: true },
      allowOwnerRegistration: { type: Boolean, default: true },
      autoApproveLands: { type: Boolean, default: true }, // if false, new lands need admin approval
      commissionPercent: { type: Number, default: 0 }, // platform cut on transactions
      minLeaseDurationMonths: { type: Number, default: 1 },
      maxImagesPerLand: { type: Number, default: 10 },
    },

    // ---- Payment ----
    payment: {
      mode: { type: String, enum: ['demo', 'live'], default: 'demo' },
      gateway: { type: String, default: 'none' }, // 'stripe' | 'razorpay' | 'none'
      enabledMethods: { type: [String], default: ['demo', 'card', 'upi'] },
    },

    // ---- Notifications ----
    notifications: {
      emailEnabled: { type: Boolean, default: false },
      smsEnabled: { type: Boolean, default: false },
      inAppEnabled: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Fetch the single settings doc, creating it with defaults if missing.
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne({ key: 'global' });
  if (!settings) {
    settings = await this.create({ key: 'global' });
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
