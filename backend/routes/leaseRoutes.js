const express = require('express');
const router = express.Router();
const {
  getSeekerLeases,
  getOwnerLeases,
  getLeaseById,
} = require('../controllers/leaseController');
const { protect, authorize } = require('../middleware/auth');

router.get('/seeker', protect, authorize('user'), getSeekerLeases);
router.get('/owner', protect, authorize('owner'), getOwnerLeases);
router.get('/:id', protect, getLeaseById);

module.exports = router;
