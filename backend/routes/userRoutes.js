const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

const {
  getDashboardStats,
  getDashboard,
} = require('../controllers/userDashboardController');
const {
  browseLands,
  getLandById,
} = require('../controllers/userLandController');
const {
  getRequests,
  getRequestById,
  createRequest,
  cancelRequest,
} = require('../controllers/userRequestController');
const {
  getLeases,
  getLeaseById,
} = require('../controllers/userLeaseController');
const {
  getSpendingSummary,
  getPayments,
  getPaymentById,
  createPaymentIntent,
  verifyPayment,
} = require('../controllers/userPaymentController');

// All user routes require an authenticated seeker (role: 'user')
router.use(protect, authorize('user'));

// ---- Dashboard ----
router.get('/dashboard', getDashboard);
router.get('/dashboard/stats', getDashboardStats);

// ---- Browse Lands ----
router.get('/lands', browseLands);
router.get('/lands/:id', getLandById);

// ---- Lease Requests (sent by me) ----
router.get('/requests', getRequests);
router.post('/requests', createRequest);
router.get('/requests/:id', getRequestById);
router.delete('/requests/:id', cancelRequest);

// ---- Active Leases ----
router.get('/leases', getLeases);
router.get('/leases/:id', getLeaseById);

// ---- Payments (spending) ----
router.get('/payments/summary', getSpendingSummary);
router.post('/payments/create-intent', createPaymentIntent);
router.post('/payments/verify', verifyPayment);
router.get('/payments', getPayments);
router.get('/payments/:id', getPaymentById);

module.exports = router;
