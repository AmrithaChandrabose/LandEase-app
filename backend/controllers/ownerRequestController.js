const LeaseRequest = require('../models/LeaseRequest');
const ActiveLease = require('../models/ActiveLease');
const Land = require('../models/Land');
const {
  asyncHandler,
  getPagination,
  paginatedResponse,
} = require('../utils/helpers');
const { createNotification } = require('../utils/notify');

// GET /api/owner/requests
// Query: status, landId, search, page, limit, sort
const getRequests = asyncHandler(async (req, res) => {
  const { status, landId, sort = '-createdAt' } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = { ownerId: req.user._id };
  if (status) filter.status = status;
  if (landId) filter.landId = landId;

  const [requests, total] = await Promise.all([
    LeaseRequest.find(filter)
      .populate('landId', 'title location price images status')
      .populate('seekerId', 'fullName email phone')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    LeaseRequest.countDocuments(filter),
  ]);

  res.json(paginatedResponse(requests, total, page, limit));
});

// GET /api/owner/requests/:id
const getRequestById = asyncHandler(async (req, res) => {
  const request = await LeaseRequest.findById(req.params.id)
    .populate('landId', 'title location price images status')
    .populate('seekerId', 'fullName email phone');
  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }
  if (request.ownerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this request');
  }
  res.json(request);
});

// PUT /api/owner/requests/:id/status  - approve or reject
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

    if (land) {
      land.status = 'leased';
      await land.save();
    }

    // Auto-reject other pending requests on the same land
    await LeaseRequest.updateMany(
      { landId: request.landId, _id: { $ne: request._id }, status: 'pending' },
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
  getRequests,
  getRequestById,
  updateRequestStatus,
};
