const Land = require('../models/Land');
const ActiveLease = require('../models/ActiveLease');
const LeaseRequest = require('../models/LeaseRequest');
const {
  asyncHandler,
  getPagination,
  paginatedResponse,
  parseLeadingNumber,
} = require('../utils/helpers');

// GET /api/owner/lands
// Query: status, location, search, minPrice, maxPrice, page, limit, sort
const getMyLands = asyncHandler(async (req, res) => {
  const { status, location, search, minPrice, maxPrice, sort = '-createdAt' } =
    req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = { ownerId: req.user._id };
  if (status) filter.status = status;
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
    Land.find(filter).sort(sort).skip(skip).limit(limit),
    Land.countDocuments(filter),
  ]);

  res.json(paginatedResponse(lands, total, page, limit));
});

// GET /api/owner/lands/:id  - own land with lease/request context
const getMyLandById = asyncHandler(async (req, res) => {
  const land = await Land.findById(req.params.id);
  if (!land) {
    res.status(404);
    throw new Error('Land not found');
  }
  if (land.ownerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this land');
  }

  const [activeLease, pendingRequests] = await Promise.all([
    ActiveLease.findOne({ landId: land._id, status: 'active' }).populate(
      'seekerId',
      'fullName email phone'
    ),
    LeaseRequest.countDocuments({ landId: land._id, status: 'pending' }),
  ]);

  res.json({ land, activeLease, pendingRequests });
});

// POST /api/owner/lands  - create a listing
const createLand = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    location,
    area,
    minLeaseDuration,
    price,
    status,
  } = req.body;

  if (!title || !location || !area || !minLeaseDuration || price === undefined) {
    res.status(400);
    throw new Error('title, location, area, minLeaseDuration and price are required');
  }

  let images = [];
  if (req.files && req.files.length > 0) {
    images = req.files.map(file => `uploads/lands/${file.filename}`);
  }

  const land = await Land.create({
    ownerId: req.user._id,
    title,
    description,
    location,
    area,
    areaInAcres: parseLeadingNumber(area),
    minLeaseDuration,
    minLeaseDurationInMonths: parseLeadingNumber(minLeaseDuration),
    price: Number(price),
    images: images,
    status: status || 'available',
  });

  res.status(201).json(land);
});

// PUT /api/owner/lands/:id  - edit own listing
const updateLand = asyncHandler(async (req, res) => {
  const land = await Land.findById(req.params.id);
  if (!land) {
    res.status(404);
    throw new Error('Land not found');
  }
  if (land.ownerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to edit this land');
  }

  const fields = ['title', 'description', 'location', 'price', 'status'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) land[f] = req.body[f];
  });

  // Handle existing and new images
  let images = land.images;
  if (req.body.existingImages !== undefined) {
    try {
      images = typeof req.body.existingImages === 'string'
        ? JSON.parse(req.body.existingImages)
        : req.body.existingImages;
    } catch (e) {
      images = [];
    }
  }

  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(file => `uploads/lands/${file.filename}`);
    images = [...images, ...newImages];
  }
  land.images = images;

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

// PUT /api/owner/lands/:id/status  - toggle availability
// Owner may set 'available' or 'unavailable'. 'leased' is managed by the lease flow.
const updateLandStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['available', 'unavailable'].includes(status)) {
    res.status(400);
    throw new Error("status must be 'available' or 'unavailable'");
  }

  const land = await Land.findById(req.params.id);
  if (!land) {
    res.status(404);
    throw new Error('Land not found');
  }
  if (land.ownerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this land');
  }
  if (land.status === 'leased') {
    res.status(400);
    throw new Error('Cannot change status while the land is leased');
  }

  land.status = status;
  await land.save();
  res.json({ _id: land._id, status: land.status });
});

// DELETE /api/owner/lands/:id
const deleteLand = asyncHandler(async (req, res) => {
  const land = await Land.findById(req.params.id);
  if (!land) {
    res.status(404);
    throw new Error('Land not found');
  }
  if (land.ownerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this land');
  }
  const active = await ActiveLease.findOne({
    landId: land._id,
    status: 'active',
  });
  if (active) {
    res.status(400);
    throw new Error('Cannot delete land with an active lease');
  }
  await land.deleteOne();
  res.json({ message: 'Land deleted', _id: land._id });
});

module.exports = {
  getMyLands,
  getMyLandById,
  createLand,
  updateLand,
  updateLandStatus,
  deleteLand,
};
