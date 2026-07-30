const ActiveLease = require('../models/ActiveLease');
const Land = require('../models/Land');
const {
  asyncHandler,
  getPagination,
  paginatedResponse,
} = require('../utils/helpers');

// GET /api/admin/leases
// Query: status, isPaid, ownerId, seekerId, page, limit, sort
const getAllLeases = asyncHandler(async (req, res) => {
  const { status, isPaid, ownerId, seekerId, sort = '-createdAt' } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = {};
  if (status) filter.status = status;
  if (isPaid === 'true') filter.isPaid = true;
  if (isPaid === 'false') filter.isPaid = false;
  if (ownerId) filter.ownerId = ownerId;
  if (seekerId) filter.seekerId = seekerId;

  const [leases, total] = await Promise.all([
    ActiveLease.find(filter)
      .populate('landId', 'title location price')
      .populate('ownerId', 'fullName email')
      .populate('seekerId', 'fullName email')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    ActiveLease.countDocuments(filter),
  ]);

  res.json(paginatedResponse(leases, total, page, limit));
});

// GET /api/admin/leases/:id
const getLeaseById = asyncHandler(async (req, res) => {
  const lease = await ActiveLease.findById(req.params.id)
    .populate('landId', 'title location price images')
    .populate('ownerId', 'fullName email phone')
    .populate('seekerId', 'fullName email phone');
  if (!lease) {
    res.status(404);
    throw new Error('Lease not found');
  }
  res.json(lease);
});

// PUT /api/admin/leases/:id/status  - terminate/complete a lease
const updateLeaseStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'completed', 'terminated'].includes(status)) {
    res.status(400);
    throw new Error("status must be 'active', 'completed' or 'terminated'");
  }
  const lease = await ActiveLease.findById(req.params.id);
  if (!lease) {
    res.status(404);
    throw new Error('Lease not found');
  }

  lease.status = status;
  await lease.save();

  // When a lease ends, free up the land again
  if (status === 'completed' || status === 'terminated') {
    await Land.findByIdAndUpdate(lease.landId, { status: 'available' });
  }

  res.json({ _id: lease._id, status: lease.status });
});

module.exports = {
  getAllLeases,
  getLeaseById,
  updateLeaseStatus,
};
