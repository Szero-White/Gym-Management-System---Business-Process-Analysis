const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const staffController = require('../controllers/staffController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const upload = require('../middlewares/upload');

// @route   GET api/staff
// @desc    Get all staff members
// @access  Private (admin only)
router.get(
  '/',
  [auth, roleCheck('admin')],
  staffController.getAllStaff
);

// @route   GET api/staff/:id
// @desc    Get staff member by ID
// @access  Private (admin only)
router.get(
  '/:id',
  [auth, roleCheck('admin')],
  staffController.getStaffById
);

// @route   POST api/staff
// @desc    Add new staff member
// @access  Private (admin only)
router.post(
  '/',
  [
    auth,
    roleCheck('admin'),
    [
      check('username', 'Vui lòng nhập username').not().isEmpty(),
      check('password', 'Vui lòng nhập mật khẩu ít nhất 6 ký tự').isLength({ min: 6 }),
      check('email', 'Vui lòng nhập email hợp lệ').isEmail(),
      check('fullName', 'Vui lòng nhập họ tên').not().isEmpty(),
      check('phoneNumber', 'Vui lòng nhập số điện thoại').not().isEmpty(),
      check('role', 'Vui lòng chọn vai trò hợp lệ').isIn(['admin', 'receptionist'])
    ]
  ],
  staffController.addStaff
);

// @route   PUT api/staff/:id
// @desc    Update staff member
// @access  Private (admin only)
router.put(
  '/:id',
  [
    auth,
    roleCheck('admin'),
    [
      check('email', 'Vui lòng nhập email hợp lệ').optional().isEmail(),
      check('fullName', 'Vui lòng nhập họ tên').optional().not().isEmpty(),
      check('phoneNumber', 'Vui lòng nhập số điện thoại').optional().not().isEmpty()
    ]
  ],
  staffController.updateStaff
);

// @route   PUT api/staff/:id/activate
// @desc    Activate staff account
// @access  Private (admin only)
router.put(
  '/:id/activate',
  [auth, roleCheck('admin')],
  staffController.activateStaff
);

// @route   PUT api/staff/:id/deactivate
// @desc    Deactivate staff account
// @access  Private (admin only)
router.put(
  '/:id/deactivate',
  [auth, roleCheck('admin')],
  staffController.deactivateStaff
);

router.put(
  '/:id/profile-image',
  [auth, roleCheck('admin')],
  upload.single('profileImage'),
  staffController.uploadProfileImage
);

module.exports = router;