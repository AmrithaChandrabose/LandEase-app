const Land = require('../models/Land');
const LeaseRequest = require('../models/LeaseRequest');
const {
  asyncHandler,
  getPagination,
  paginatedResponse,
} = require('../utils/helpers');

// GET /api/user/lands  - browse lands available to lease
// Query: location, minPrice, maxPrice, minArea, maxArea, search, status, page, limit, sort
const browseLands = asyncHandler(async (req, res) => {
  const {
    location,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    search,
    status,
    sort = '-createdAt',
  } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = {};
  // Seekers browse available lands by default
  filter.status = status || 'available';

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
  if (minArea || maxArea) {
    filter.areaInAcres = {};
    if (minArea) filter.areaInAcres.$gte = Number(minArea);
    if (maxArea) filter.areaInAcres.$lte = Number(maxArea);
  }

  const [lands, total] = await Promise.all([
    Land.find(filter)
      .populate('ownerId', 'fullName email phone')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Land.countDocuments(filter),
  ]);

  // Flag which of these lands the seeker already has a pending request on
  const landIds = lands.map((l) => l._id);
  const myPending = await LeaseRequest.find({
    seekerId: req.user._id,
    landId: { $in: landIds },
    status: 'pending',
  }).select('landId');
  const pendingSet = new Set(myPending.map((r) => r.landId.toString()));

  const data = lands.map((l) => ({
    ...l.toObject(),
    hasPendingRequest: pendingSet.has(l._id.toString()),
  }));

  res.json(paginatedResponse(data, total, page, limit));
});

// GET /api/user/lands/:id  - land detail (with the seeker's request state)
const getLandById = asyncHandler(async (req, res) => {
  const land = await Land.findById(req.params.id).populate(
    'ownerId',
    'fullName email phone profileImage'
  );
  if (!land) {
    res.status(404);
    throw new Error('Land not found');
  }

  const myRequest = await LeaseRequest.findOne({
    seekerId: req.user._id,
    landId: land._id,
  })
    .sort('-createdAt')
    .select('status requestedDuration createdAt');

  res.json({ land, myRequest: myRequest || null });
});

module.exports = { browseLands, getLandById };
