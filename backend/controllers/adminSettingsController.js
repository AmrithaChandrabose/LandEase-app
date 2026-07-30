const Settings = require('../models/Settings');
const { asyncHandler } = require('../utils/helpers');

const GROUPS = ['general', 'ui', 'platform', 'payment', 'notifications'];

// GET /api/admin/settings  - full settings object
const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSettings();
  res.json(settings);
});

// PUT /api/admin/settings  - update one or more groups
// Body may contain any subset of: general, ui, platform, payment, notifications
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSettings();

  GROUPS.forEach((group) => {
    if (req.body[group] && typeof req.body[group] === 'object') {
      // Merge provided keys into the existing sub-document
      Object.keys(req.body[group]).forEach((key) => {
        settings[group][key] = req.body[group][key];
      });
      settings.markModified(group);
    }
  });

  const updated = await settings.save();
  res.json(updated);
});

// PUT /api/admin/settings/:group  - update a single group
const updateSettingsGroup = asyncHandler(async (req, res) => {
  const { group } = req.params;
  if (!GROUPS.includes(group)) {
    res.status(400);
    throw new Error(`Invalid settings group. Must be one of: ${GROUPS.join(', ')}`);
  }

  const settings = await Settings.getSettings();
  Object.keys(req.body || {}).forEach((key) => {
    settings[group][key] = req.body[key];
  });
  settings.markModified(group);

  const updated = await settings.save();
  res.json({ [group]: updated[group] });
});

// POST /api/admin/settings/reset  - reset all settings to defaults
const resetSettings = asyncHandler(async (req, res) => {
  await Settings.deleteOne({ key: 'global' });
  const settings = await Settings.getSettings(); // recreates with defaults
  res.json({ message: 'Settings reset to defaults', settings });
});

// GET /api/settings/public  - PUBLIC, read-only UI/branding for the frontend
// Exposes only the safe fields needed to render the app (no admin config).
const getPublicSettings = asyncHandler(async (req, res) => {
  const s = await Settings.getSettings();
  res.json({
    general: {
      siteName: s.general.siteName,
      supportEmail: s.general.supportEmail,
      supportPhone: s.general.supportPhone,
      currency: s.general.currency,
      currencySymbol: s.general.currencySymbol,
      maintenanceMode: s.general.maintenanceMode,
      maintenanceMessage: s.general.maintenanceMode
        ? s.general.maintenanceMessage
        : '',
    },
    ui: s.ui,
    platform: {
      allowRegistration: s.platform.allowRegistration,
      allowOwnerRegistration: s.platform.allowOwnerRegistration,
      minLeaseDurationMonths: s.platform.minLeaseDurationMonths,
      maxImagesPerLand: s.platform.maxImagesPerLand,
    },
    payment: {
      mode: s.payment.mode,
      enabledMethods: s.payment.enabledMethods,
    },
  });
});

module.exports = {
  getSettings,
  getPublicSettings,
  updateSettings,
  updateSettingsGroup,
  resetSettings,
};
