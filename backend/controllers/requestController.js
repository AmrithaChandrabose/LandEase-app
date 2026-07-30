const LeaseRequest = require('../models/LeaseRequest');
const ActiveLease = require('../models/ActiveLease');
const Land = require('../models/Land');
const { asyncHandler, parseLeadingNumber } = require('../utils/helpers');
const { createNotification } = require('../utils/notify');

// POST /api/requests  (seeker)
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

  // Prevent duplicate pending requests on the same land by the same seeker
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

// GET /api/requests/seeker  (seeker)
const getSeekerRequests = asyncHandler(async (req, res) => {
  const requests = await LeaseRequest.find({ seekerId: req.user._id })
    .populate('landId', 'title location price images status')
    .populate('ownerId', 'fullName email phone')
    .sort('-createdAt');
  res.json(requests);
});

// GET /api/requests/owner  (owner)
const getOwnerRequests = asyncHandler(async (req, res) => {
  const requests = await LeaseRequest.find({ ownerId: req.user._id })
    .populate('landId', 'title location price images status')
    .populate('seekerId', 'fullName email phone')
    .sort('-createdAt');
  res.json(requests);
});

// PUT /api/requests/:id/status  (owner) - approve/reject
const updateRequestStatus = asyncHandler(async (req, res) => {
  const { status, startDate, endDate } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error("status must be 'approved' or 'rejected'");
  }

  const request = await LeaseRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }
  if (request.ownerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this request');
  }
  if (request.status !== 'pending') {
    res.status(400);
    throw new Error(`Request already ${request.status}`);
  }

  request.status = status;
  await request.save();

  let activeLease = null;

  if (status === 'approved') {
    const land = await Land.findById(request.landId);

    // Derive lease dates
    const start = startDate ? new Date(startDate) : new Date();
    let end;
    if (endDate) {
      end = new Date(endDate);
    } else {
      const months = request.requestedDurationInMonths || 12;
      end = new Date(start);
      end.setMonth(end.getMonth() + months);
    }

    activeLease = await ActiveLease.create({
      requestId: request._id,
      landId: request.landId,
      seekerId: request.seekerId,
      ownerId: request.ownerId,
      startDate: start,
      endDate: end,
      rentAmount: land ? land.price : 0,
      nextPaymentDueDate: start,
      paidMonthsCount: 0,
    });

    // Mark land as leased
    if (land) {
      land.status = 'leased';
      await land.save();
    }

    // Auto-reject other pending requests on the same land
    await LeaseRequest.updateMany(
      {
        landId: request.landId,
        _id: { $ne: request._id },
        status: 'pending',
      },
      { $set: { status: 'rejected' } }
    );

    await createNotification({
      userId: request.seekerId,
      title: 'Lease Request Approved',
      message: 'Your lease request was approved. Proceed to payment to confirm.',
      type: 'lease_request',
    });
  } else {
    await createNotification({
      userId: request.seekerId,
      title: 'Lease Request Rejected',
      message: 'Your lease request was rejected by the owner.',
      type: 'lease_request',
    });
  }

  res.json({ request, activeLease });
});

module.exports = {
  createRequest,
  getSeekerRequests,
  getOwnerRequests,
  updateRequestStatus,
};
