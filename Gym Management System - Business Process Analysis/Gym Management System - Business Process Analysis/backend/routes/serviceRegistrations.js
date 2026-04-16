const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const serviceRegistrationController = require('../controllers/serviceRegistrationController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

// @route   GET api/service-registrations
// @desc    Lấy tất cả đăng ký dịch vụ
// @access  Private (admin, receptionist)
router.get(
  '/',
  [auth, roleCheck('admin', 'receptionist')],
  serviceRegistrationController.getAllRegistrations
);

// @route   GET api/service-registrations/my-registrations
// @desc    Lấy đăng ký dịch vụ của khách hàng hiện tại
// @access  Private (customer)
router.get(
  '/my-registrations',
  [auth, roleCheck('customer')],
  serviceRegistrationController.getMyRegistrations
);

// @route   GET api/service-registrations/my-customers
// @desc    Lấy đăng ký dịch vụ của huấn luyện viên hiện tại
// @access  Private (trainer)
router.get(
  '/my-customers',
  [auth, roleCheck('trainer')],
  serviceRegistrationController.getTrainerRegistrations
);

// @route   GET api/service-registrations/:id
// @desc    Lấy đăng ký dịch vụ theo ID
// @access  Private
router.get(
  '/:id',
  auth,
  serviceRegistrationController.getRegistrationById
);

// @route   POST api/service-registrations
// @desc    Tạo đăng ký dịch vụ mới
// @access  Private (customer, admin, receptionist)
router.post(
  '/',
  [
    auth,
    [
      check('trainerId', 'ID huấn luyện viên là bắt buộc').not().isEmpty(),
      check('serviceId', 'ID dịch vụ là bắt buộc').not().isEmpty(),
      check('workScheduleId', 'ID lịch làm việc là bắt buộc').not().isEmpty(),
      check('startDate', 'Ngày bắt đầu là bắt buộc').not().isEmpty(),
      check('numberOfSessions', 'Số buổi là bắt buộc').isNumeric().isInt({ min: 1 })
    ]
  ],
  serviceRegistrationController.createRegistration
);

// @route   PUT api/service-registrations/:id/status
// @desc    Cập nhật trạng thái đăng ký dịch vụ (duyệt/từ chối)
// @access  Private (trainer, admin, receptionist)
router.put(
  '/:id/status',
  [
    auth,
    roleCheck('trainer', 'admin', 'receptionist'),
    [
      check('status', 'Trạng thái là bắt buộc').isIn(['approved', 'rejected']),
      check('rejectionReason', 'Lý do từ chối là bắt buộc khi từ chối').custom((value, { req }) => {
        if (req.body.status === 'rejected' && !value) {
          throw new Error('Lý do từ chối là bắt buộc khi từ chối');
        }
        return true;
      })
    ]
  ],
  serviceRegistrationController.updateRegistrationStatus
);

// @route   PUT api/service-registrations/:id/sessions
// @desc    Cập nhật số buổi đã hoàn thành
// @access  Private (trainer, admin, receptionist)
router.put(
  '/:id/sessions',
  [
    auth,
    roleCheck('trainer', 'admin', 'receptionist'),
    [
      check('completedSessions', 'Số buổi đã hoàn thành là bắt buộc').isNumeric().isInt({ min: 0 })
    ]
  ],
  serviceRegistrationController.updateCompletedSessions
);

// @route   PUT api/service-registrations/:id/cancel
// @desc    Hủy đăng ký dịch vụ
// @access  Private (customer, admin, receptionist)
router.put(
  '/:id/cancel',
  auth,
  serviceRegistrationController.cancelRegistration
);

module.exports = router;