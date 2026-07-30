const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

const { getStats, getDashboard } = require('../controllers/adminController');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  updateUserRole,
  deleteUser,
} = require('../controllers/adminUserController');
const {
  getAllLands,
  getLandById,
  updateLand,
  updateLandStatus,
  deleteLand,
} = require('../controllers/adminLandController');
const {
  getAllLeases,
  getLeaseById,
  updateLeaseStatus,
} = require('../controllers/adminLeaseController');

const {
  getAllTransactions,
  getTransactionById,
  updateTransactionStatus,
} = require('../controllers/adminTransactionController');
const {
  getSummaryReport,
  getRevenueReport,
  getUserGrowthReport,
  getLandsReport,
  getTopOwnersReport,
  exportTransactionsCsv,
} = require('../controllers/adminReportController');
const {
  getSettings,
  updateSettings,
  updateSettingsGroup,
  resetSettings,
} = require('../controllers/adminSettingsController');

// All admin routes require an authenticated admin
router.use(protect, authorize('admin'));

// ---- Dashboard ----
router.get('/stats', getStats);
router.get('/dashboard', getDashboard);

// ---- Users ----
router.get('/users', getUsers);
router.post('/users', createUser);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// ---- Lands ----
router.get('/lands', getAllLands);
router.get('/lands/:id', getLandById);
router.put('/lands/:id', updateLand);
router.put('/lands/:id/status', updateLandStatus);
router.delete('/lands/:id', deleteLand);

// ---- Leases ----
router.get('/leases', getAllLeases);
router.get('/leases/:id', getLeaseById);
router.put('/leases/:id/status', updateLeaseStatus);

// ---- Transactions ----
router.get('/transactions', getAllTransactions);
router.get('/transactions/:id', getTransactionById);
router.put('/transactions/:id/status', updateTransactionStatus);

// ---- Reports ----
router.get('/reports/summary', getSummaryReport);
router.get('/reports/revenue', getRevenueReport);
router.get('/reports/users', getUserGrowthReport);
router.get('/reports/lands', getLandsReport);
router.get('/reports/top-owners', getTopOwnersReport);
router.get('/reports/export/transactions', exportTransactionsCsv);

// ---- Settings ----
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.post('/settings/reset', resetSettings);
router.put('/settings/:group', updateSettingsGroup);

module.exports = router;
