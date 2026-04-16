const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const maintenanceController = require('../controllers/maintenanceController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

// @route   GET api/maintenance
// @desc    Get all maintenance records
// @access  Private (admin, receptionist)
router.get(
  '/',
  [auth, roleCheck('admin', 'receptionist')],
  maintenanceController.getAllMaintenance
);

// @route   GET api/maintenance/upcoming
// @desc    Get upcoming maintenance (next 7 days)
// @access  Private (admin, receptionist)
router.get(
  '/upcoming',
  [auth, roleCheck('admin', 'receptionist')],
  maintenanceController.getUpcomingMaintenance
);

// @route   GET api/maintenance/overdue
// @desc    Get overdue maintenance
// @access  Private (admin, receptionist)
router.get(
  '/overdue',
  [auth, roleCheck('admin', 'receptionist')],
  maintenanceController.getOverdueMaintenance
);

// @route   GET api/maintenance/equipment/:equipmentId
// @desc    Get maintenance records for specific equipment
// @access  Private (admin, receptionist)
router.get(
  '/equipment/:equipmentId',
  [auth, roleCheck('admin', 'receptionist')],
  maintenanceController.getMaintenanceByEquipment
);

// @route   GET api/maintenance/:id
// @desc    Get maintenance by ID
// @access  Private (admin, receptionist)
router.get(
  '/:id',
  [auth, roleCheck('admin', 'receptionist')],
  maintenanceController.getMaintenanceById
);

// @route   POST api/maintenance
// @desc    Add new maintenance record
// @access  Private (admin only)
router.post(
  '/',
  [
    auth,
    roleCheck('admin'),
    [
      check('equipment', 'ID thiết bị là bắt buộc').not().isEmpty(),
      check('maintenanceType', 'Loại bảo trì là bắt buộc').isIn(['routine', 'repair', 'inspection', 'cleaning', 'other']),
      check('scheduledDate', 'Ngày lên lịch là bắt buộc').not().isEmpty()
    ]
  ],
  maintenanceController.addMaintenance
);

// @route   PUT api/maintenance/:id
// @desc    Update maintenance record
// @access  Private (admin only)
router.put(
  '/:id',
  [
    auth,
    roleCheck('admin'),
    [
      check('maintenanceType', 'Loại bảo trì không hợp lệ').optional().isIn(['routine', 'repair', 'inspection', 'cleaning', 'other']),
      check('status', 'Trạng thái không hợp lệ').optional().isIn(['scheduled', 'in-progress', 'completed', 'canceled'])
    ]
  ],
  maintenanceController.updateMaintenance
);

// @route   DELETE api/maintenance/:id
// @desc    Delete maintenance record
// @access  Private (admin only)
router.delete(
  '/:id',
  [auth, roleCheck('admin')],
  maintenanceController.deleteMaintenance
);

module.exports = router;