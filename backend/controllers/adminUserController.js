const User = require('../models/User');
const Land = require('../models/Land');
const {
  asyncHandler,
  getPagination,
  paginatedResponse,
} = require('../utils/helpers');

// GET /api/admin/users
// Query: role, status(active|blocked), search, page, limit, sort
const getUsers = asyncHandler(async (req, res) => {
  const { role, status, search, sort = '-createdAt' } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = {};
  if (role) filter.role = role;
  if (status === 'active') filter.isActive = true;
  if (status === 'blocked') filter.isActive = false;
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json(paginatedResponse(users, total, page, limit));
});

// GET /api/admin/users/:id  (with a little activity summary)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Small activity snapshot depending on role
  const landsCount =
    user.role === 'owner'
      ? await Land.countDocuments({ ownerId: user._id })
      : 0;

  res.json({ user, stats: { landsCount } });
});

// POST /api/admin/users  - admin creates a user (any role, including admin)
const createUser = asyncHandler(async (req, res) => {
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

  const safeRole = ['user', 'owner', 'admin'].includes(role) ? role : 'user';

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
    isActive: user.isActive,
  });
});

// PUT /api/admin/users/:id  - update user details
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('+password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { fullName, phone, email, profileImage, password } = req.body;
  if (fullName !== undefined) user.fullName = fullName;
  if (phone !== undefined) user.phone = phone;
  if (profileImage !== undefined) user.profileImage = profileImage;
  if (email !== undefined && email.toLowerCase() !== user.email) {
    const taken = await User.findOne({ email: email.toLowerCase() });
    if (taken) {
      res.status(400);
      throw new Error('Email already in use');
    }
    user.email = email.toLowerCase();
  }
  if (password) user.password = password; // re-hashed by pre-save hook

  const updated = await user.save();
  res.json({
    _id: updated._id,
    fullName: updated.fullName,
    email: updated.email,
    phone: updated.phone,
    role: updated.role,
    profileImage: updated.profileImage,
    isActive: updated.isActive,
  });
});

// PUT /api/admin/users/:id/status  - block/activate
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot change status of an admin account');
  }
  user.isActive = isActive === undefined ? !user.isActive : Boolean(isActive);
  await user.save();
  res.json({ _id: user._id, isActive: user.isActive });
});

// PUT /api/admin/users/:id/role  - change a user's role
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['user', 'owner', 'admin'].includes(role)) {
    res.status(400);
    throw new Error("role must be 'user', 'owner' or 'admin'");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent removing the last admin
  if (user.role === 'admin' && role !== 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      res.status(400);
      throw new Error('Cannot demote the last remaining admin');
    }
  }

  user.role = role;
  await user.save();
  res.json({ _id: user._id, role: user.role });
});

// DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }
  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      res.status(400);
      throw new Error('Cannot delete the last remaining admin');
    }
  }
  await user.deleteOne();
  res.json({ message: 'User deleted', _id: user._id });
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  updateUserRole,
  deleteUser,
};
