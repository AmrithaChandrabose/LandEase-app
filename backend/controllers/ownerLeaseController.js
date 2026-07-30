const ActiveLease = require('../models/ActiveLease');
const Land = require('../models/Land');
const {
  asyncHandler,
  getPagination,
  paginatedResponse,
} = require('../utils/helpers');
const { createNotification } = require('../utils/notify');

// GET /api/owner/leases
// Query: status, isPaid, landId, page, limit, sort
const getLeases = asyncHandler(async (req, res) => {
  const { status, isPaid, landId, sort = '-createdAt' } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = { ownerId: req.user._id };
  if (status) filter.status = status;
  if (isPaid === 'true') filter.isPaid = true;
  if (isPaid === 'false') filter.isPaid = false;
  if (landId) filter.landId = landId;

  const [leases, total] = await Promise.all([
    ActiveLease.find(filter)
      .populate('landId', 'title location price images')
      .populate('seekerId', 'fullName email phone')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    ActiveLease.countDocuments(filter),
  ]);

  res.json(paginatedResponse(leases, total, page, limit));
});

// GET /api/owner/leases/:id
const getLeaseById = asyncHandler(async (req, res) => {
  const lease = await ActiveLease.findById(req.params.id)
    .populate('landId', 'title location price images')
    .populate('seekerId', 'fullName email phone');
  if (!lease) {
    res.status(404);
    throw new Error('Lease not found');
  }
  if (lease.ownerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this lease');
  }
  res.json(lease);
});

// PUT /api/owner/leases/:id/status  - complete or terminate a lease
// Owner cannot re-open a lease to 'active'; that state comes from approval.
const updateLeaseStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['completed', 'terminated'].includes(status)) {
    res.status(400);
    throw new Error("status must be 'completed' or 'terminated'");
  }

  const lease = await ActiveLease.findById(req.params.id);
  if (!lease) {
    res.status(404);
    throw new Error('Lease not found');
  }
  if (lease.ownerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this lease');
  }
  if (lease.status !== 'active') {
    res.status(400);
    throw new Error(`Lease already ${lease.status}`);
  }

  lease.status = status;
  await lease.save();

  // Free the land back to available
  await Land.findByIdAndUpdate(lease.landId, { status: 'available' });

  await createNotification({
    userId: lease.seekerId,
    title: status === 'completed' ? 'Lease Completed' : 'Lease Terminated',
    message:
      status === 'completed'
        ? 'Your lease has been marked as completed by the owner.'
        : 'Your lease has been terminated by the owner.',
    type: 'system',
  });

  res.json({ _id: lease._id, status: lease.status });
});

module.exports = {
  getLeases,
  getLeaseById,
  updateLeaseStatus,
};
