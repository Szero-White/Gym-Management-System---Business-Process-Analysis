const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const upload = require('../middlewares/upload');

// @route   GET api/users/customers
// @desc    Lấy danh sách tất cả khách hàng
// @access  Private (admin, receptionist)
router.get(
  '/customers',
  [auth, roleCheck('admin', 'receptionist')],
  userController.getAllCustomers
);

// @route   GET api/users/trainers
// @desc    Lấy danh sách tất cả huấn luyện viên
// @access  Private (admin, receptionist, customer)
router.get(
  '/trainers',
  [auth, roleCheck('admin', 'receptionist', 'customer')],
  userController.getAllTrainers
);

// @route   POST api/users/customers
// @desc    Thêm khách hàng mới
// @access  Private (admin, receptionist)
router.post(
  '/customers',
  [
    auth,
    roleCheck('admin', 'receptionist'),
    [
      check('username', 'Vui lòng nhập username').not().isEmpty(),
      check('password', 'Vui lòng nhập mật khẩu ít nhất 6 ký tự').isLength({ min: 6 }),
      check('email', 'Vui lòng nhập email hợp lệ').isEmail(),
      check('fullName', 'Vui lòng nhập họ tên').not().isEmpty(),
      check('phoneNumber', 'Vui lòng nhập số điện thoại').not().isEmpty()
    ]
  ],
  userController.addCustomer
);

// @route   POST api/users/trainers
// @desc    Thêm huấn luyện viên mới
// @access  Private (admin, receptionist) 
router.post(
  '/trainers',
  [
    auth,
    roleCheck('admin', 'receptionist'),
    [
      check('username', 'Vui lòng nhập username').not().isEmpty(),
      check('password', 'Vui lòng nhập mật khẩu ít nhất 6 ký tự').isLength({ min: 6 }),
      check('email', 'Vui lòng nhập email hợp lệ').isEmail(),
      check('fullName', 'Vui lòng nhập họ tên').not().isEmpty(),
      check('phoneNumber', 'Vui lòng nhập số điện thoại').not().isEmpty()
    ]
  ],
  userController.addTrainer
);

// @route   PUT api/users/customers/:id
// @desc    Cập nhật thông tin khách hàng
// @access  Private (admin, receptionist)
router.put(
  '/customers/:id',
  [auth, roleCheck('admin', 'receptionist')],
  userController.updateCustomer
);

// @route   PUT api/users/trainers/:id
// @desc    Cập nhật thông tin huấn luyện viên
// @access  Private (admin, receptionist)

router.put(
  '/trainers/:id/activate',
  [auth, roleCheck('admin', 'receptionist')],
  userController.activateTrainer
);

router.put(
  '/trainers/:id/deactivate',
  [auth, roleCheck('admin', 'receptionist')],
  userController.deactivateTrainer
);
router.put(
  '/trainers/:id',
  [auth, roleCheck('admin', 'receptionist')],
  userController.updateTrainer
);

// Reset password for customer
router.put(
  '/customers/:id/reset-password',
  [
    auth, 
    roleCheck('admin', 'receptionist'),
    [
      check('password', 'Mật khẩu phải có ít nhất 6 ký tự').isLength({ min: 6 })
    ]
  ],
  userController.resetCustomerPassword
);

// Reset password for trainer
router.put(
  '/trainers/:id/reset-password',
  [
    auth, 
    roleCheck('admin', 'receptionist'),
    [
      check('password', 'Mật khẩu phải có ít nhất 6 ký tự').isLength({ min: 6 })
    ]
  ],
  userController.resetTrainerPassword
);


// @route   DELETE api/users/customers/:id
// @desc    Vô hiệu hóa tài khoản khách hàng
// @access  Private (admin, receptionist)
router.delete(
  '/customers/:id',
  [auth, roleCheck('admin', 'receptionist')],
  userController.deleteCustomer
);

// @route   PUT api/users/customers/:id/activate
// @desc    Kích hoạt tài khoản khách hàng
// @access  Private (admin, receptionist)
router.put(
  '/customers/:id/activate',
  [auth, roleCheck('admin', 'receptionist')],
  userController.activateCustomer
);

// @route   GET api/users/customers/:id
// @desc    Lấy thông tin chi tiết của một khách hàng
// @access  Private (admin, receptionist)
router.get(
  '/customers/:id',
  [auth, roleCheck('admin', 'receptionist')],
  userController.getCustomer
);

// @route   GET api/users/trainers/:id
// @desc    Lấy thông tin chi tiết của một huấn luyện viên
// @access  Private (admin, receptionist, customer)
router.get(
  '/trainers/:id',
  [auth, roleCheck('admin', 'receptionist', 'customer')],
  userController.getTrainer
);

router.put(
  '/trainers/:id/profile-image',
  [auth, roleCheck('admin', 'receptionist')],
  upload.single('profileImage'),
  userController.uploadTrainerProfileImage
);

// @route   PUT api/users/customers/:id/profile-image
// @desc    Upload ảnh đại diện cho khách hàng
// @access  Private (admin, receptionist)
router.put(
  '/customers/:id/profile-image',
  [auth, roleCheck('admin', 'receptionist')],
  upload.single('profileImage'),
  userController.uploadCustomerProfileImage
);

module.exports = router;