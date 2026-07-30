const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  verifyPayment,
  getPaymentHistory,
  getEarnings,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/create-intent', protect, authorize('user'), createPaymentIntent);
router.post('/verify', protect, authorize('user'), verifyPayment);
router.get('/history', protect, authorize('user'), getPaymentHistory);
router.get('/earnings', protect, authorize('owner'), getEarnings);

module.exports = router;
