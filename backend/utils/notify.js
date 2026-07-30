const Notification = require('../models/Notification');

// Fire-and-forget notification creator. Won't crash main flow on failure.
const createNotification = async ({ userId, title, message, type = 'system' }) => {
  try {
    await Notification.create({ userId, title, message, type });
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};

module.exports = { createNotification };
