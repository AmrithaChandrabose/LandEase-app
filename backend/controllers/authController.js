const crypto = require('crypto');
const User = require('../models/User');
const { generateToken, asyncHandler } = require('../utils/helpers');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, role } = req.body;

  if (!fullName || !email || !phone || !password) {
    res.status(400);
    throw new Error('fullName, email, phone and password are required');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error('Email already registered');
  }

  // Only allow 'user' or 'owner' on public registration; admins are seeded/promoted.
  const safeRole = ['user', 'owner'].includes(role) ? role : 'user';

  const user = await User.create({
    fullName,
    email,
    phone,
    password,
    role: safeRole,
  });

  res.status(201).json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    profileImage: user.profileImage,
    token: generateToken(user._id, user.role),
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error('Account is deactivated');
  }

  res.json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    profileImage: user.profileImage,
    token: generateToken(user._id, user.role),
  });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');

  const { fullName, phone, profileImage, password } = req.body;
  if (fullName !== undefined) user.fullName = fullName;
  if (phone !== undefined) user.phone = phone;
  if (profileImage !== undefined) user.profileImage = profileImage;
  if (password) user.password = password; // will be re-hashed by pre-save hook

  const updated = await user.save();

  res.json({
    _id: updated._id,
    fullName: updated.fullName,
    email: updated.email,
    phone: updated.phone,
    role: updated.role,
    profileImage: updated.profileImage,
  });
});

// POST /api/auth/logout
// JWTs are stateless, so there's no server-side session to destroy — the client
// should discard its stored token. This endpoint acknowledges the logout and
// clears the auth cookie in case cookie-based auth is used later.
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// POST /api/auth/forgot-password  (demo: returns a reset token in response)
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });

  // Always respond success to avoid email enumeration
  if (!user) {
    return res.json({
      message: 'If that email exists, a reset link has been sent.',
    });
  }

  const rawToken = crypto.randomBytes(20).toString('hex');
  user.resetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  // In production you'd email a link. For demo we return the token directly.
  res.json({
    message: 'Password reset token generated (demo).',
    resetToken: rawToken,
    note: 'Send this token to POST /api/auth/reset-password with the new password.',
  });
});

// POST /api/auth/reset-password  (demo companion to forgot-password)
const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, password } = req.body;
  if (!resetToken || !password) {
    res.status(400);
    throw new Error('resetToken and password are required');
  }

  const hashed = crypto.createHash('sha256').update(resetToken).digest('hex');
  const user = await User.findOne({
    resetToken: hashed,
    resetTokenExpiry: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = password;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.json({ message: 'Password reset successful' });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
};
