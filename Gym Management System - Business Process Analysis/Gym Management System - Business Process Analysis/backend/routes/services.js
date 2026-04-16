const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const serviceController = require('../controllers/serviceController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

// @route   GET api/services
// @desc    Lấy tất cả dịch vụ
// @access  Public
router.get('/', serviceController.getAllServices);

// @route   GET api/services/:id
// @desc    Lấy dịch vụ theo ID
// @access  Public
router.get('/:id', serviceController.getServiceById);

// @route   GET api/services/trainer/:trainerId
// @desc    Lấy dịch vụ theo huấn luyện viên
// @access  Public
router.get('/trainer/:trainerId', serviceController.getTrainerServices);

// @route   POST api/services
// @desc    Thêm dịch vụ mới
// @access  Private (admin, trainer)
router.post(
  '/',
  [
    auth,
    roleCheck('admin', 'trainer'),
    [
      check('name', 'Tên dịch vụ là bắt buộc').not().isEmpty(),
      check('description', 'Mô tả dịch vụ là bắt buộc').not().isEmpty(),
      check('price', 'Giá dịch vụ là bắt buộc').isNumeric(),
      check('duration', 'Thời lượng dịch vụ là bắt buộc').isNumeric()
    ]
  ],
  serviceController.addService
);

// @route   PUT api/services/:id
// @desc    Cập nhật dịch vụ
// @access  Private (admin, trainer who owns the service)
router.put(
  '/:id',
  [
    auth,
    roleCheck('admin', 'trainer'),
    [
      check('name', 'Tên dịch vụ không được để trống').optional().not().isEmpty(),
      check('description', 'Mô tả dịch vụ không được để trống').optional().not().isEmpty(),
      check('price', 'Giá dịch vụ phải là số').optional().isNumeric(),
      check('duration', 'Thời lượng dịch vụ phải là số').optional().isNumeric(),
      check('category', 'Danh mục không hợp lệ').optional().isIn(['personal', 'group', 'special'])
    ]
  ],
  serviceController.updateService
);

// @route   DELETE api/services/:id
// @desc    Xóa dịch vụ (vô hiệu hóa)
// @access  Private (admin, trainer who owns the service)
router.delete(
  '/:id',
  [auth, roleCheck('admin', 'trainer')],
  serviceController.deleteService
);

module.exports = router;