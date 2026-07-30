const ActiveLease = require('../models/ActiveLease');
const {
  asyncHandler,
  getPagination,
  paginatedResponse,
} = require('../utils/helpers');

// GET /api/user/leases  - the seeker's leases (paginated)
// Query: status, isPaid, landId, page, limit, sort
const getLeases = asyncHandler(async (req, res) => {
  const { status, isPaid, landId, sort = '-createdAt' } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = { seekerId: req.user._id };
  if (status) filter.status = status;
  if (isPaid === 'true') filter.isPaid = true;
  if (isPaid === 'false') filter.isPaid = false;
  if (landId) filter.landId = landId;

  const [leases, total] = await Promise.all([
    ActiveLease.find(filter)
      .populate('landId', 'title location price images')
      .populate('ownerId', 'fullName email phone')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    ActiveLease.countDocuments(filter),
  ]);

  res.json(paginatedResponse(leases, total, page, limit));
});

// GET /api/user/leases/:id
const getLeaseById = asyncHandler(async (req, res) => {
  const lease = await ActiveLease.findById(req.params.id)
    .populate('landId', 'title location price images')
    .populate('ownerId', 'fullName email phone');
  if (!lease) {
    res.status(404);
    throw new Error('Lease not found');
  }
  if (lease.seekerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this lease');
  }
  res.json(lease);
});

module.exports = { getLeases, getLeaseById };
