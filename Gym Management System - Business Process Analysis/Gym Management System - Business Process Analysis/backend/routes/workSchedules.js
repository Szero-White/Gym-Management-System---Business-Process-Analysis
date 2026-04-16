const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const workScheduleController = require('../controllers/workScheduleController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

// @route   GET api/work-schedules/trainer/:trainerId
// @desc    Lấy lịch làm việc của huấn luyện viên cụ thể
// @access  Private
router.get(
  '/trainer/:trainerId',
  auth,
  workScheduleController.getTrainerSchedules
);

// @route   GET api/work-schedules/my-schedules
// @desc    Lấy lịch làm việc của huấn luyện viên hiện tại
// @access  Private (trainer)
router.get(
  '/my-schedules',
  [auth, roleCheck('trainer')],
  workScheduleController.getMySchedules
);

// @route   GET api/work-schedules/available/:trainerId
// @desc    Lấy tất cả lịch làm việc có sẵn của huấn luyện viên
// @access  Private
router.get(
  '/available/:trainerId',
  auth,
  workScheduleController.getAvailableSchedules
);

// @route   POST api/work-schedules
// @desc    Tạo lịch làm việc mới
// @access  Private (trainer)
router.post(
  '/',
  [
    auth,
    roleCheck('trainer'),
    [
      check('dayOfWeek', 'Ngày trong tuần là bắt buộc').not().isEmpty(),
      check('dayOfWeek', 'Ngày trong tuần không hợp lệ').isIn([
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
      ]),
      check('startTime', 'Thời gian bắt đầu là bắt buộc').not().isEmpty(),
      check('endTime', 'Thời gian kết thúc là bắt buộc').not().isEmpty()
    ]
  ],
  workScheduleController.createWorkSchedule
);

// @route   PUT api/work-schedules/:id
// @desc    Cập nhật lịch làm việc
// @access  Private (trainer)
router.put(
  '/:id',
  [
    auth,
    roleCheck('trainer'),
    [
      check('dayOfWeek', 'Ngày trong tuần không hợp lệ')
        .optional()
        .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    ]
  ],
  workScheduleController.updateWorkSchedule
);

// @route   DELETE api/work-schedules/:id
// @desc    Xóa lịch làm việc
// @access  Private (trainer)
router.delete(
  '/:id',
  [auth, roleCheck('trainer')],
  workScheduleController.deleteWorkSchedule
);

module.exports = router;