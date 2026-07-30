const LeaseRequest = require('../models/LeaseRequest');
const Land = require('../models/Land');
const {
  asyncHandler,
  getPagination,
  paginatedResponse,
  parseLeadingNumber,
} = require('../utils/helpers');
const { createNotification } = require('../utils/notify');

// GET /api/user/requests  - the seeker's own requests (paginated)
// Query: status, landId, page, limit, sort
const getRequests = asyncHandler(async (req, res) => {
  const { status, landId, sort = '-createdAt' } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = { seekerId: req.user._id };
  if (status) filter.status = status;
  if (landId) filter.landId = landId;

  const [requests, total] = await Promise.all([
    LeaseRequest.find(filter)
      .populate('landId', 'title location price images status')
      .populate('ownerId', 'fullName email phone')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    LeaseRequest.countDocuments(filter),
  ]);

  res.json(paginatedResponse(requests, total, page, limit));
});

// GET /api/user/requests/:id
const getRequestById = asyncHandler(async (req, res) => {
  const request = await LeaseRequest.findById(req.params.id)
    .populate('landId', 'title location price images status')
    .populate('ownerId', 'fullName email phone');
  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }
  if (request.seekerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this request');
  }
  res.json(request);
});

// POST /api/user/requests  - submit a lease request
const createRequest = asyncHandler(async (req, res) => {
  const { landId, requestedDuration, message } = req.body;

  if (!landId || !requestedDuration) {
    res.status(400);
    throw new Error('landId and requestedDuration are required');
  }

  const land = await Land.findById(landId);
  if (!land) {
    res.status(404);
    throw new Error('Land not found');
  }
  if (land.status !== 'available') {
    res.status(400);
    throw new Error('This land is not available for lease');
  }
  if (land.ownerId.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot request your own land');
  }

  const existing = await LeaseRequest.findOne({
    landId,
    seekerId: req.user._id,
    status: 'pending',
  });
  if (existing) {
    res.status(400);
    throw new Error('You already have a pending request for this land');
  }

  const request = await LeaseRequest.create({
    landId,
    seekerId: req.user._id,
    ownerId: land.ownerId,
    requestedDuration,
    requestedDurationInMonths: parseLeadingNumber(requestedDuration),
    message: message || '',
  });

  await createNotification({
    userId: land.ownerId,
    title: 'New Lease Request',
    message: `${req.user.fullName} requested to lease "${land.title}".`,
    type: 'lease_request',
  });

  res.status(201).json(request);
});

// DELETE /api/user/requests/:id  - cancel/withdraw a pending request
const cancelRequest = asyncHandler(async (req, res) => {
  const request = await LeaseRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }
  if (request.seekerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to cancel this request');
  }
  if (request.status !== 'pending') {
    res.status(400);
    throw new Error(`Only pending requests can be cancelled (this one is ${request.status})`);
  }

  await request.deleteOne();
  res.json({ message: 'Request cancelled', _id: request._id });
});

module.exports = {
  getRequests,
  getRequestById,
  createRequest,
  cancelRequest,
};
