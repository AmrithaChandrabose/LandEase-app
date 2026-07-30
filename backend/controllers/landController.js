const Land = require('../models/Land');
const { asyncHandler, parseLeadingNumber } = require('../utils/helpers');

// GET /api/lands  (public, with filters)
// Query: location, minPrice, maxPrice, minArea, maxArea, status, search, page, limit, sort
const getLands = asyncHandler(async (req, res) => {
  const {
    location,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    status,
    search,
    page = 1,
    limit = 20,
    sort = '-createdAt',
  } = req.query;

  const filter = {};

  // Default browse shows only available lands unless a status is explicitly requested
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

  const skip = (Number(page) - 1) * Number(limit);

  const [lands, total] = await Promise.all([
    Land.find(filter)
      .populate('ownerId', 'fullName email phone')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Land.countDocuments(filter),
  ]);

  res.json({
    data: lands,
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / Number(limit)),
  });
});

// GET /api/lands/:id  (public)
const getLandById = asyncHandler(async (req, res) => {
  const land = await Land.findById(req.params.id).populate(
    'ownerId',
    'fullName email phone profileImage'
  );
  if (!land) {
    res.status(404);
    throw new Error('Land not found');
  }
  res.json(land);
});

// POST /api/lands  (owner)
const createLand = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    location,
    area,
    minLeaseDuration,
    price,
    images,
    status,
  } = req.body;

  if (!title || !location || !area || !minLeaseDuration || price === undefined) {
    res.status(400);
    throw new Error('title, location, area, minLeaseDuration and price are required');
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
    images: Array.isArray(images) ? images : [],
    status: status || 'available',
  });

  res.status(201).json(land);
});

// PUT /api/lands/:id  (owner - own listing only)
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

  const fields = ['title', 'description', 'location', 'price', 'images', 'status'];
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

// DELETE /api/lands/:id  (owner - own listing only)
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
  await land.deleteOne();
  res.json({ message: 'Land removed' });
});

// GET /api/lands/owner/my-lands  (owner)
const getMyLands = asyncHandler(async (req, res) => {
  const lands = await Land.find({ ownerId: req.user._id }).sort('-createdAt');
  res.json(lands);
});

module.exports = {
  getLands,
  getLandById,
  createLand,
  updateLand,
  deleteLand,
  getMyLands,
};
