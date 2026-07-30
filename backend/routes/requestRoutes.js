const express = require('express');
const router = express.Router();
const {
  createRequest,
  getSeekerRequests,
  getOwnerRequests,
  updateRequestStatus,
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('user'), createRequest);
router.get('/seeker', protect, authorize('user'), getSeekerRequests);
router.get('/owner', protect, authorize('owner'), getOwnerRequests);
router.put('/:id/status', protect, authorize('owner'), updateRequestStatus);

module.exports = router;
