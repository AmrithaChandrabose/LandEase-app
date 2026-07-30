const ActiveLease = require('../models/ActiveLease');
const { asyncHandler } = require('../utils/helpers');

// GET /api/leases/seeker  (seeker)
const getSeekerLeases = asyncHandler(async (req, res) => {
  const leases = await ActiveLease.find({ seekerId: req.user._id })
    .populate('landId', 'title location price images')
    .populate('ownerId', 'fullName email phone')
    .sort('-createdAt');
  res.json(leases);
});

// GET /api/leases/owner  (owner)
const getOwnerLeases = asyncHandler(async (req, res) => {
  const leases = await ActiveLease.find({ ownerId: req.user._id })
    .populate('landId', 'title location price images')
    .populate('seekerId', 'fullName email phone')
    .sort('-createdAt');
  res.json(leases);
});

// GET /api/leases/:id  (owner or seeker involved)
const getLeaseById = asyncHandler(async (req, res) => {
  const lease = await ActiveLease.findById(req.params.id)
    .populate('landId', 'title location price images')
    .populate('ownerId', 'fullName email phone')
    .populate('seekerId', 'fullName email phone');

  if (!lease) {
    res.status(404);
    throw new Error('Lease not found');
  }

  const uid = req.user._id.toString();
  const isParty =
    lease.ownerId._id.toString() === uid ||
    lease.seekerId._id.toString() === uid ||
    req.user.role === 'admin';

  if (!isParty) {
    res.status(403);
    throw new Error('Not authorized to view this lease');
  }

  res.json(lease);
});

module.exports = { getSeekerLeases, getOwnerLeases, getLeaseById };
