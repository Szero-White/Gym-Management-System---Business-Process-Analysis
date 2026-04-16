const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const scheduleController = require('../controllers/scheduleController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

// @route   GET /api/schedule/me
// @desc    Lấy lịch làm việc của huấn luyện viên đang đăng nhập
// @access  Private (trainer)
router.get(
  '/me',
  [auth, roleCheck('trainer')],
  scheduleController.getMySchedule
);

// @route   GET /api/schedule/:trainerId
// @desc    Lấy lịch làm việc của huấn luyện viên
// @access  Private (admin, receptionist, trainer(self))
router.get(
  '/:trainerId',
  [auth],
  scheduleController.getSchedule
);

// @route   PUT /api/schedule/:trainerId
// @desc    Cập nhật toàn bộ lịch làm việc của huấn luyện viên
// @access  Private (admin, trainer(self))
router.put(
  '/:trainerId',
  [
    auth,
    [
      check('schedule', 'Dữ liệu lịch làm việc không hợp lệ').isArray()
    ]
  ],
  scheduleController.updateSchedule
);

// @route   POST /api/schedule/:trainerId
// @desc    Thêm lịch làm việc mới cho huấn luyện viên
// @access  Private (admin, trainer(self))
router.post(
  '/:trainerId',
  [
    auth,
    [
      check('day', 'Ngày trong tuần là bắt buộc').not().isEmpty()
        .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
      check('startTime', 'Thời gian bắt đầu là bắt buộc').not().isEmpty(),
      check('endTime', 'Thời gian kết thúc là bắt buộc').not().isEmpty()
    ]
  ],
  scheduleController.addScheduleItem
);

// @route   DELETE /api/schedule/:trainerId/:scheduleId
// @desc    Xóa lịch làm việc của huấn luyện viên
// @access  Private (admin, trainer(self))
router.delete(
  '/:trainerId/:scheduleId',
  [auth],
  scheduleController.deleteScheduleItem
);

// @route   POST /api/schedule/sync
router.post(
  '/sync',
  [auth, roleCheck('trainer', 'admin')],
  scheduleController.syncScheduleToWorkSchedule
);

// Cho admin đồng bộ cho trainer cụ thể
router.post(
  '/:trainerId/sync',
  [auth, roleCheck('admin')],
  scheduleController.syncScheduleToWorkSchedule
);

module.exports = router;