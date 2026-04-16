const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const equipmentController = require('../controllers/equipmentController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const upload = require('../middlewares/upload');

// @route   GET api/equipment
// @desc    Get all equipment
// @access  Private (admin, receptionist)
router.get(
  '/',
  [auth, roleCheck('admin', 'receptionist')],
  equipmentController.getAllEquipment
);

// @route   GET api/equipment/maintenance-required
// @desc    Get equipment that needs maintenance soon
// @access  Private (admin, receptionist)
router.get(
  '/maintenance-required',
  [auth, roleCheck('admin', 'receptionist')],
  equipmentController.getEquipmentNeedingMaintenance
);

// @route   GET api/equipment/:id
// @desc    Get equipment by ID
// @access  Private (admin, receptionist)

// @route   GET api/equipment/customer
// @desc    Get equipment for customers
// @access  Private (customer)
router.get(
  '/customer',
  [auth, roleCheck('admin', 'receptionist', 'customer')], // Cho phép cả admin, receptionist và customer
  equipmentController.getCustomerEquipment
);

router.get(
  '/:id',
  [auth, roleCheck('admin', 'receptionist')],
  equipmentController.getEquipmentById
);

// @route   POST api/equipment
// @desc    Add new equipment
// @access  Private (admin only)
router.post(
  '/',
  [
    auth,
    roleCheck('admin'),
    [
      check('name', 'Tên thiết bị là bắt buộc').not().isEmpty(),
      check('type', 'Loại thiết bị là bắt buộc').not().isEmpty()
    ]
  ],
  equipmentController.addEquipment
);

// @route   PUT api/equipment/:id
// @desc    Update equipment
// @access  Private (admin only)
router.put(
  '/:id',
  [
    auth,
    roleCheck('admin'),
    [
      check('name', 'Tên thiết bị là bắt buộc').not().isEmpty(),
      check('type', 'Loại thiết bị là bắt buộc').not().isEmpty()
    ]
  ],
  equipmentController.updateEquipment
);

// @route   PATCH api/equipment/:id/status
// @desc    Update equipment status
// @access  Private (admin only)
router.patch(
  '/:id/status',
  [
    auth,
    roleCheck('admin'),
    [
      check('status', 'Trạng thái thiết bị là bắt buộc').isIn(['new', 'in-use', 'damaged', 'maintenance', 'retired'])
    ]
  ],
  equipmentController.updateEquipmentStatus
);

// @route   DELETE api/equipment/:id
// @desc    Delete equipment
// @access  Private (admin only)
router.delete(
  '/:id',
  [auth, roleCheck('admin')],
  equipmentController.deleteEquipment
);

// @route   PUT api/equipment/:id/image
// @desc    Upload equipment image
// @access  Private (admin only)
router.put(
  '/:id/image',
  [auth, roleCheck('admin')],
  upload.single('equipmentImage'),
  equipmentController.uploadEquipmentImage
);


module.exports = router;