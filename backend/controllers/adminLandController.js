const Land = require('../models/Land');
const ActiveLease = require('../models/ActiveLease');
const LeaseRequest = require('../models/LeaseRequest');
const {
  asyncHandler,
  getPagination,
  paginatedResponse,
  parseLeadingNumber,
} = require('../utils/helpers');

// GET /api/admin/lands
// Query: status, location, ownerId, search, minPrice, maxPrice, page, limit, sort
const getAllLands = asyncHandler(async (req, res) => {
  const {
    status,
    location,
    ownerId,
    search,
    minPrice,
    maxPrice,
    sort = '-createdAt',
  } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = {};
  if (status) filter.status = status;
  if (ownerId) filter.ownerId = ownerId;
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];
  }
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const [lands, total] = await Promise.all([
    Land.find(filter)
      .populate('ownerId', 'fullName email phone')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Land.countDocuments(filter),
  ]);

  res.json(paginatedResponse(lands, total, page, limit));
});

// GET /api/admin/lands/:id
const getLandById = asyncHandler(async (req, res) => {
  const land = await Land.findById(req.params.id).populate(
    'ownerId',
    'fullName email phone'
  );
  if (!land) {
    res.status(404);
    throw new Error('Land not found');
  }

  const [activeLease, requestCount] = await Promise.all([
    ActiveLease.findOne({ landId: land._id, status: 'active' }).populate(
      'seekerId',
      'fullName email phone'
    ),
    LeaseRequest.countDocuments({ landId: land._id }),
  ]);

  res.json({ land, activeLease, requestCount });
});

// PUT /api/admin/lands/:id  - admin can edit any land
const updateLand = asyncHandler(async (req, res) => {
  const land = await Land.findById(req.params.id);
  if (!land) {
    res.status(404);
    throw new Error('Land not found');
  }

  const fields = ['title', 'description', 'location', 'price', 'images'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) land[f] = req.body[f];
  });
  if (req.body.area !== undefined) {
    land.area = req.body.area;
    land.areaInAcres = parseLeadingNumber(req.body.area);
  }
  if (req.body.minLeaseDuration !== undefined) {
    land.minLeaseDuration = req.body.minLeaseDuration;
    land.minLeaseDurationInMonths = parseLeadingNumber(req.body.minLeaseDuration);
  }

  const updated = await land.save();
  res.json(updated);
});

// PUT /api/admin/lands/:id/status  - force a status (moderation)
const updateLandStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['available', 'leased', 'unavailable'].includes(status)) {
    res.status(400);
    throw new Error("status must be 'available', 'leased' or 'unavailable'");
  }
  const land = await Land.findById(req.params.id);
  if (!land) {
    res.status(404);
    throw new Error('Land not found');
  }
  land.status = status;
  await land.save();
  res.json({ _id: land._id, status: land.status });
});

// DELETE /api/admin/lands/:id
const deleteLand = asyncHandler(async (req, res) => {
  const land = await Land.findById(req.params.id);
  if (!land) {
    res.status(404);
    throw new Error('Land not found');
  }
  const active = await ActiveLease.findOne({ landId: land._id, status: 'active' });
  if (active) {
    res.status(400);
    throw new Error('Cannot delete land with an active lease');
  }
  await land.deleteOne();
  res.json({ message: 'Land deleted', _id: land._id });
});

module.exports = {
  getAllLands,
  getLandById,
  updateLand,
  updateLandStatus,
  deleteLand,
};
