const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

// @route   POST api/auth/register
// @desc    Đăng ký tài khoản mới
// @access  Private (chỉ admin hoặc lễ tân)
router.post(
  '/register',
  [
    auth,
    roleCheck('admin', 'receptionist'),
    [
      check('username', 'Vui lòng nhập username').not().isEmpty(),
      check('password', 'Vui lòng nhập mật khẩu ít nhất 6 ký tự').isLength({ min: 6 }),
      check('email', 'Vui lòng nhập email hợp lệ').isEmail(),
      check('fullName', 'Vui lòng nhập họ tên').not().isEmpty(),
      check('phoneNumber', 'Vui lòng nhập số điện thoại').not().isEmpty(),
      check('role', 'Vui lòng chọn vai trò hợp lệ').isIn(['admin', 'trainer', 'receptionist', 'customer'])
    ]
  ],
  authController.register
);

// @route   POST api/auth/login
// @desc    Đăng nhập và lấy token
// @access  Public
router.post(
  '/login',
  [
    check('username', 'Vui lòng nhập username').exists(),
    check('password', 'Vui lòng nhập mật khẩu').exists()
  ],
  authController.login
);

// @route   GET api/auth/me
// @desc    Lấy thông tin người dùng đã đăng nhập
// @access  Private
router.get('/me', auth, authController.getMe);

module.exports = router;