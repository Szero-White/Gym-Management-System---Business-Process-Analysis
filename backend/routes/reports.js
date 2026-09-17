// backend/routes/reports.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

// @route   GET api/reports/customer-registrations
// @desc    Get customer registration statistics
// @access  Private (admin)
router.get(
  '/customer-registrations',
  [auth, roleCheck('admin')],
  reportController.getCustomerRegistrationStats
);

// @route   GET api/reports/service-registrations
// @desc    Get service registration statistics
// @access  Private (admin)
router.get(
  '/service-registrations',
  [auth, roleCheck('admin')],
  reportController.getServiceRegistrationStats
);

module.exports = router;