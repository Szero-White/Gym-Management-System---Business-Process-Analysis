const { validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');
const Customer = require('../models/Customer');

// @desc    Gửi phản hồi mới
// @route   POST /api/feedback
// @access  Private (customer)
exports.createFeedback = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { content, rating } = req.body;
  
  try {
    // Tìm thông tin khách hàng
    const customer = await Customer.findOne({ user: req.user.id });
    
    if (!customer) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin khách hàng' });
    }
    
    const newFeedback = new Feedback({
      customer: customer._id,
      content,
      rating,
      isRead: false
    });
    
    const feedback = await newFeedback.save();
    
    await feedback.populate({
      path: 'customer',
      populate: { path: 'user', select: 'fullName email' }
    });
    
    res.status(201).json(feedback);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// @desc    Lấy tất cả phản hồi
// @route   GET /api/feedback
// @access  Private (admin, receptionist)
exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate({
        path: 'customer',
        populate: { path: 'user', select: 'fullName email profileImage' }
      })
      .sort({ createdAt: -1 });
    
    res.json(feedback);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// @desc    Lấy phản hồi theo ID
// @route   GET /api/feedback/:id
// @access  Private (admin, receptionist)
exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate({
        path: 'customer',
        populate: { path: 'user', select: 'fullName email profileImage' }
      });
    
    if (!feedback) {
      return res.status(404).json({ message: 'Không tìm thấy phản hồi' });
    }
    
    // Đánh dấu đã đọc
    if (!feedback.isRead) {
      feedback.isRead = true;
      await feedback.save();
    }
    
    res.json(feedback);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy phản hồi' });
    }
    
    res.status(500).send('Lỗi server');
  }
};

// @desc    Lấy phản hồi của khách hàng hiện tại
// @route   GET /api/feedback/my-feedback
// @access  Private (customer)
exports.getMyFeedback = async (req, res) => {
  try {
    // Tìm thông tin khách hàng
    const customer = await Customer.findOne({ user: req.user.id });
    
    if (!customer) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin khách hàng' });
    }
    
    const feedback = await Feedback.find({ customer: customer._id })
      .sort({ createdAt: -1 });
    
    res.json(feedback);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// @desc    Xóa phản hồi
// @route   DELETE /api/feedback/:id
// @access  Private (admin)
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Không tìm thấy phản hồi' });
    }
    
    await feedback.remove();
    
    res.json({ message: 'Phản hồi đã được xóa' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy phản hồi' });
    }
    
    res.status(500).send('Lỗi server');
  }
};

// @desc    Đánh dấu phản hồi đã đọc
// @route   PUT /api/feedback/:id/mark-read
// @access  Private (admin, receptionist)
exports.markAsRead = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Không tìm thấy phản hồi' });
    }
    
    feedback.isRead = true;
    await feedback.save();
    
    res.json(feedback);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy phản hồi' });
    }
    
    res.status(500).send('Lỗi server');
  }
};

// @desc    Lấy số lượng phản hồi chưa đọc
// @route   GET /api/feedback/unread-count
// @access  Private (admin, receptionist)
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Feedback.countDocuments({ isRead: false });
    
    res.json({ count });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};