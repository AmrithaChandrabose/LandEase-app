const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const {
  getDashboardStats,
  getDashboard,
} = require('../controllers/ownerDashboardController');
const {
  getMyLands,
  getMyLandById,
  createLand,
  updateLand,
  updateLandStatus,
  deleteLand,
} = require('../controllers/ownerLandController');
const {
  getRequests,
  getRequestById,
  updateRequestStatus,
} = require('../controllers/ownerRequestController');
const {
  getLeases,
  getLeaseById,
  updateLeaseStatus,
} = require('../controllers/ownerLeaseController');
const {
  getEarningsSummary,
  getPayments,
  getPaymentById,
  getPaymentsForLease,
  exportPaymentsCsv,
} = require('../controllers/ownerPaymentController');

// All owner routes require an authenticated owner
router.use(protect, authorize('owner'));

// ---- Dashboard ----
router.get('/dashboard', getDashboard);
router.get('/dashboard/stats', getDashboardStats);

// ---- Lands (my listings) ----
router.get('/lands', getMyLands);
router.post('/lands', upload.array('images', 10), createLand);
router.get('/lands/:id', getMyLandById);
router.put('/lands/:id', upload.array('images', 10), updateLand);
router.put('/lands/:id/status', updateLandStatus);
router.delete('/lands/:id', deleteLand);

// ---- Lease Requests (incoming) ----
router.get('/requests', getRequests);
router.get('/requests/:id', getRequestById);
router.put('/requests/:id/status', updateRequestStatus);

// ---- Active Leases ----
router.get('/leases', getLeases);
router.get('/leases/:id', getLeaseById);
router.put('/leases/:id/status', updateLeaseStatus);

// ---- Payments / Earnings ----
router.get('/payments/summary', getEarningsSummary);
router.get('/payments/export', exportPaymentsCsv);
router.get('/payments/lease/:leaseId', getPaymentsForLease);
router.get('/payments', getPayments);
router.get('/payments/:id', getPaymentById);

module.exports = router;
