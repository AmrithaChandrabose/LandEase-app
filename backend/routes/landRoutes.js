const express = require('express');
const router = express.Router();
const {
  getLands,
  getLandById,
  createLand,
  updateLand,
  deleteLand,
  getMyLands,
} = require('../controllers/landController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Owner's own listings (must be before '/:id')
router.get('/owner/my-lands', protect, authorize('owner'), getMyLands);

router.get('/', getLands);
router.get('/:id', getLandById);

router.post('/', protect, authorize('owner'), upload.array('images', 10), createLand);
router.put('/:id', protect, authorize('owner'), upload.array('images', 10), updateLand);
router.delete('/:id', protect, authorize('owner'), deleteLand);

module.exports = router;
