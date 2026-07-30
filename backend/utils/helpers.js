const jwt = require('jsonwebtoken');

// Generate a JWT for a user
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.jwtKey, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Wrap async controllers so errors flow to the error handler
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Extract leading number from strings like "2 acre", "12 Months", "12 mo min"
const parseLeadingNumber = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const match = String(value).match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
};

// Build pagination params from query. Returns { page, limit, skip }.
const getPagination = (query, defaultLimit = 20) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// Standard paginated response wrapper.
const paginatedResponse = (data, total, page, limit) => ({
  data,
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

module.exports = {
  generateToken,
  asyncHandler,
  parseLeadingNumber,
  getPagination,
  paginatedResponse,
};
