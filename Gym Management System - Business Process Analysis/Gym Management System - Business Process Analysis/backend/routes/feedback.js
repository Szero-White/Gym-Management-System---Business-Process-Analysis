const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const feedbackController = require('../controllers/feedbackController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

// @route   POST api/feedback
// @desc    Gửi phản hồi mới
// @access  Private (customer)
router.post(
  '/',
  [
    auth,
    roleCheck('customer'),
    [
      check('content', 'Nội dung phản hồi là bắt buộc').not().isEmpty(),
      check('rating', 'Đánh giá phải là số từ 1 đến 5').isInt({ min: 1, max: 5 })
    ]
  ],
  feedbackController.createFeedback
);

// @route   GET api/feedback
// @desc    Lấy tất cả phản hồi
// @access  Private (admin, receptionist)
router.get(
  '/',
  [auth, roleCheck('admin', 'receptionist')],
  feedbackController.getAllFeedback
);

// @route   GET api/feedback/my-feedback
// @desc    Lấy phản hồi của khách hàng hiện tại
// @access  Private (customer)
router.get(
  '/my-feedback',
  [auth, roleCheck('customer')],
  feedbackController.getMyFeedback
);

// @route   GET api/feedback/unread-count
// @desc    Lấy số lượng phản hồi chưa đọc
// @access  Private (admin, receptionist)
router.get(
  '/unread-count',
  [auth, roleCheck('admin', 'receptionist')],
  feedbackController.getUnreadCount
);

// @route   GET api/feedback/:id
// @desc    Lấy phản hồi theo ID
// @access  Private (admin, receptionist)
router.get(
  '/:id',
  [auth, roleCheck('admin', 'receptionist')],
  feedbackController.getFeedbackById
);

// @route   PUT api/feedback/:id/mark-read
// @desc    Đánh dấu phản hồi đã đọc
// @access  Private (admin, receptionist)
router.put(
  '/:id/mark-read',
  [auth, roleCheck('admin', 'receptionist')],
  feedbackController.markAsRead
);

// @route   DELETE api/feedback/:id
// @desc    Xóa phản hồi
// @access  Private (admin)
router.delete(
  '/:id',
  [auth, roleCheck('admin')],
  feedbackController.deleteFeedback
);

module.exports = router;