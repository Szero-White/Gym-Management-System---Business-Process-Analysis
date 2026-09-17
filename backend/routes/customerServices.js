const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const customerServiceController = require('../controllers/customerServiceController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

// @route   GET api/customer-services/:customerId
// @desc    Lấy tất cả đăng ký dịch vụ của khách hàng
// @access  Private (admin, receptionist)
router.get(
  '/:customerId',
  [auth, roleCheck('admin', 'receptionist')],
  customerServiceController.getCustomerServices
);

// @route   POST api/customer-services/:customerId
// @desc    Đăng ký dịch vụ mới cho khách hàng
// @access  Private (admin, receptionist)
router.post(
  '/:customerId',
  [
    auth,
    roleCheck('admin', 'receptionist'),
    [
      check('trainerId', 'ID huấn luyện viên là bắt buộc').not().isEmpty(),
      check('serviceId', 'ID dịch vụ là bắt buộc').not().isEmpty(),
      check('startDate', 'Ngày bắt đầu là bắt buộc').not().isEmpty(),
      check('numberOfSessions', 'Số buổi là bắt buộc').isNumeric().isInt({ min: 1 })
    ]
  ],
  customerServiceController.addCustomerService
);

// @route   PUT api/customer-services/:registrationId
// @desc    Cập nhật đăng ký dịch vụ của khách hàng
// @access  Private (admin, receptionist)
router.put(
  '/:registrationId',
  [
    auth,
    roleCheck('admin', 'receptionist')
  ],
  customerServiceController.updateCustomerService
);

// @route   DELETE api/customer-services/:registrationId
// @desc    Xóa đăng ký dịch vụ của khách hàng
// @access  Private (admin)
router.delete(
  '/:registrationId',
  [auth, roleCheck('admin')],
  customerServiceController.deleteCustomerService
);

// @route   GET api/customer-services/:customerId/summary
// @desc    Lấy tổng quan dịch vụ của khách hàng
// @access  Private (admin, receptionist)
router.get(
  '/:customerId/summary',
  [auth, roleCheck('admin', 'receptionist')],
  customerServiceController.getServiceSummary
);

module.exports = router;