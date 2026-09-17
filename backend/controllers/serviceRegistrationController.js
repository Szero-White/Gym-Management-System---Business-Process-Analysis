const { validationResult } = require('express-validator');
const ServiceRegistration = require('../models/ServiceRegistration');
const Customer = require('../models/Customer');
const Trainer = require('../models/Trainer');
const Service = require('../models/Service');
const WorkSchedule = require('../models/WorkSchedule');
const User = require('../models/User');

// @desc    Lấy tất cả đăng ký dịch vụ
// @route   GET /api/service-registrations
// @access  Private (admin, receptionist)
exports.getAllRegistrations = async (req, res) => {
  try {
    const registrations = await ServiceRegistration.find()
      .populate({
        path: 'customer',
        populate: { path: 'user', select: 'fullName email phoneNumber' }
      })
      .populate({
        path: 'trainer',
        populate: { path: 'user', select: 'fullName' }
      })
      .populate('service')
      .populate('workSchedule')
      .sort({ createdAt: -1 });
    
    res.json(registrations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// @desc    Lấy đăng ký dịch vụ theo ID
// @route   GET /api/service-registrations/:id
// @access  Private
exports.getRegistrationById = async (req, res) => {
  try {
    const registration = await ServiceRegistration.findById(req.params.id)
      .populate({
        path: 'customer',
        populate: { path: 'user', select: 'fullName email phoneNumber' }
      })
      .populate({
        path: 'trainer',
        populate: { path: 'user', select: 'fullName' }
      })
      .populate('service')
      .populate('workSchedule');
    
    if (!registration) {
      return res.status(404).json({ message: 'Không tìm thấy đăng ký dịch vụ' });
    }
    
    // Kiểm tra quyền truy cập
    const isAdmin = req.user.role === 'admin';
    const isReceptionist = req.user.role === 'receptionist';
    const isCustomer = req.user.role === 'customer';
    const isTrainer = req.user.role === 'trainer';
    
    if (isAdmin || isReceptionist) {
      // Admin và Lễ tân có thể xem tất cả
      return res.json(registration);
    }
    
    if (isCustomer) {
      // Tìm thông tin khách hàng
      const customer = await Customer.findOne({ user: req.user.id });
      
      if (!customer || !customer._id.equals(registration.customer._id)) {
        return res.status(403).json({ message: 'Bạn không có quyền xem đăng ký này' });
      }
      
      return res.json(registration);
    }
    
    if (isTrainer) {
      // Tìm thông tin huấn luyện viên
      const trainer = await Trainer.findOne({ user: req.user.id });
      
      if (!trainer || !trainer._id.equals(registration.trainer._id)) {
        return res.status(403).json({ message: 'Bạn không có quyền xem đăng ký này' });
      }
      
      return res.json(registration);
    }
    
    return res.status(403).json({ message: 'Bạn không có quyền xem đăng ký này' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy đăng ký dịch vụ' });
    }
    
    res.status(500).send('Lỗi server');
  }
};

// @desc    Lấy đăng ký dịch vụ của khách hàng hiện tại
// @route   GET /api/service-registrations/my-registrations
// @access  Private (customer)
exports.getMyRegistrations = async (req, res) => {
  try {
    // Tìm thông tin khách hàng
    const customer = await Customer.findOne({ user: req.user.id });
    
    if (!customer) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin khách hàng' });
    }
    
    const registrations = await ServiceRegistration.find({ customer: customer._id })
      .populate({
        path: 'trainer',
        populate: { path: 'user', select: 'fullName' }
      })
      .populate('service')
      .populate('workSchedule')
      .sort({ createdAt: -1 });
    
    res.json(registrations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// @desc    Lấy đăng ký dịch vụ của huấn luyện viên hiện tại
// @route   GET /api/service-registrations/my-customers
// @access  Private (trainer)
exports.getTrainerRegistrations = async (req, res) => {
  try {
    // Tìm thông tin huấn luyện viên
    const trainer = await Trainer.findOne({ user: req.user.id });
    
    if (!trainer) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin huấn luyện viên' });
    }
    
    const registrations = await ServiceRegistration.find({ trainer: trainer._id })
      .populate({
        path: 'customer',
        populate: { path: 'user', select: 'fullName email phoneNumber profileImage' }
      })
      .populate('service')
      .populate('workSchedule')
      .sort({ createdAt: -1 });
    
    res.json(registrations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// @desc    Tạo đăng ký dịch vụ mới
// @route   POST /api/service-registrations
// @access  Private (customer, admin, receptionist)
exports.createRegistration = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { 
    trainerId, 
    serviceId, 
    workScheduleId, 
    startDate, 
    numberOfSessions, 
    notes,
    customerId // Chỉ admin/lễ tân mới được chỉ định customer ID
  } = req.body;
  
  try {
    // Xác định customer ID
    let customer;
    
    if (req.user.role === 'admin' || req.user.role === 'receptionist') {
      if (customerId) {
        customer = await Customer.findById(customerId);
        if (!customer) {
          return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
        }
      } else {
        return res.status(400).json({ message: 'Vui lòng chỉ định khách hàng' });
      }
    } else if (req.user.role === 'customer') {
      customer = await Customer.findOne({ user: req.user.id });
      if (!customer) {
        return res.status(404).json({ message: 'Không tìm thấy thông tin khách hàng' });
      }
    } else {
      return res.status(403).json({ message: 'Bạn không có quyền tạo đăng ký dịch vụ' });
    }
    
    // Kiểm tra membershipEndDate của khách hàng
    if (new Date(customer.membershipEndDate) < new Date()) {
      return res.status(400).json({ 
        message: 'Thành viên đã hết hạn. Vui lòng gia hạn trước khi đăng ký dịch vụ.' 
      });
    }
    
    // Kiểm tra trainer
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ message: 'Không tìm thấy huấn luyện viên' });
    }
    
    // Kiểm tra trạng thái tài khoản của trainer
    const trainerUser = await User.findById(trainer.user);
    if (!trainerUser || !trainerUser.active) {
      return res.status(400).json({ message: 'Huấn luyện viên này không còn hoạt động' });
    }
    
    // Kiểm tra dịch vụ
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    }
    
    if (!service.isActive) {
      return res.status(400).json({ message: 'Dịch vụ này không còn hoạt động' });
    }
    
    // Kiểm tra lịch làm việc
    const workSchedule = await WorkSchedule.findById(workScheduleId);
    if (!workSchedule) {
      return res.status(404).json({ message: 'Không tìm thấy lịch làm việc' });
    }
    
    if (!workSchedule.trainer.equals(trainer._id)) {
      return res.status(400).json({ 
        message: 'Lịch làm việc này không thuộc về huấn luyện viên được chọn' 
      });
    }
    
    if (!workSchedule.isAvailable) {
      return res.status(400).json({ message: 'Lịch làm việc này không còn khả dụng' });
    }
    
    // Kiểm tra ngày bắt đầu
    const startDateObj = new Date(startDate);
    if (startDateObj < new Date()) {
      return res.status(400).json({ message: 'Ngày bắt đầu phải sau ngày hiện tại' });
    }
    
    // Tính tổng giá
    const totalPrice = service.price;
    
    // Tạo đăng ký mới
    const newRegistration = new ServiceRegistration({
      customer: customer._id,
      trainer: trainer._id,
      service: service._id,
      workSchedule: workSchedule._id,
      startDate: startDateObj,
      numberOfSessions,
      totalPrice,
      notes
    });
    
    const registration = await newRegistration.save();
    
    // Populate thông tin để trả về
    await registration.populate([
      {
        path: 'customer',
        populate: { path: 'user', select: 'fullName email phoneNumber' }
      },
      {
        path: 'trainer',
        populate: { path: 'user', select: 'fullName' }
      },
      'service',
      'workSchedule'
    ]);
    
    res.status(201).json(registration);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// @desc    Cập nhật trạng thái đăng ký dịch vụ (duyệt/từ chối)
// @route   PUT /api/service-registrations/:id/status
// @access  Private (trainer, admin, receptionist)
exports.updateRegistrationStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { status, rejectionReason } = req.body;
  
  try {
    const registration = await ServiceRegistration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ message: 'Không tìm thấy đăng ký dịch vụ' });
    }
    
    // Kiểm tra quyền cập nhật
    const isAdmin = req.user.role === 'admin';
    const isReceptionist = req.user.role === 'receptionist';
    const isTrainer = req.user.role === 'trainer';
    
    if (!isAdmin && !isReceptionist && !isTrainer) {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật đăng ký này' });
    }
    
    if (isTrainer) {
      // Tìm thông tin huấn luyện viên
      const trainer = await Trainer.findOne({ user: req.user.id });
      
      if (!trainer || !trainer._id.equals(registration.trainer)) {
        return res.status(403).json({ message: 'Bạn không có quyền cập nhật đăng ký này' });
      }
    }
    
    // Chỉ cho phép cập nhật nếu trạng thái là 'pending'
    if (registration.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Chỉ có thể cập nhật đăng ký đang ở trạng thái chờ duyệt' 
      });
    }
    
    // Cập nhật trạng thái
    registration.status = status;
    
    // Nếu từ chối, lưu lý do
    if (status === 'rejected' && rejectionReason) {
      registration.rejectionReason = rejectionReason;
    }
    
    // Nếu hoàn thành, cập nhật số buổi đã hoàn thành
    if (status === 'completed') {
      registration.completedSessions = registration.numberOfSessions;
      registration.endDate = new Date();
    }
    
    await registration.save();
    
    // Populate thông tin để trả về
    await registration.populate([
      {
        path: 'customer',
        populate: { path: 'user', select: 'fullName email phoneNumber' }
      },
      {
        path: 'trainer',
        populate: { path: 'user', select: 'fullName' }
      },
      'service',
      'workSchedule'
    ]);
    
    res.json(registration);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// @desc    Cập nhật số buổi đã hoàn thành
// @route   PUT /api/service-registrations/:id/sessions
// @access  Private (trainer, admin, receptionist)
exports.updateCompletedSessions = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { completedSessions } = req.body;
  
  try {
    const registration = await ServiceRegistration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ message: 'Không tìm thấy đăng ký dịch vụ' });
    }
    
    // Kiểm tra quyền cập nhật
    const isAdmin = req.user.role === 'admin';
    const isReceptionist = req.user.role === 'receptionist';
    const isTrainer = req.user.role === 'trainer';
    
    if (!isAdmin && !isReceptionist && !isTrainer) {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật đăng ký này' });
    }
    
    if (isTrainer) {
      // Tìm thông tin huấn luyện viên
      const trainer = await Trainer.findOne({ user: req.user.id });
      
      if (!trainer || !trainer._id.equals(registration.trainer)) {
        return res.status(403).json({ message: 'Bạn không có quyền cập nhật đăng ký này' });
      }
    }
    
    // Chỉ cho phép cập nhật nếu trạng thái là 'approved'
    if (registration.status !== 'approved') {
      return res.status(400).json({ 
        message: 'Chỉ có thể cập nhật buổi tập cho đăng ký đã được duyệt' 
      });
    }
    
    // Kiểm tra số buổi đã hoàn thành không vượt quá tổng số buổi
    if (completedSessions > registration.numberOfSessions) {
      return res.status(400).json({ 
        message: 'Số buổi đã hoàn thành không thể vượt quá tổng số buổi' 
      });
    }
    
    // Cập nhật số buổi đã hoàn thành
    registration.completedSessions = completedSessions;
    
    // Nếu đã hoàn thành tất cả các buổi, cập nhật trạng thái và ngày kết thúc
    if (completedSessions === registration.numberOfSessions) {
      registration.status = 'completed';
      registration.endDate = new Date();
    }
    
    await registration.save();
    
    // Populate thông tin để trả về
    await registration.populate([
      {
        path: 'customer',
        populate: { path: 'user', select: 'fullName email phoneNumber' }
      },
      {
        path: 'trainer',
        populate: { path: 'user', select: 'fullName' }
      },
      'service',
      'workSchedule'
    ]);
    
    res.json(registration);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// @desc    Hủy đăng ký dịch vụ
// @route   PUT /api/service-registrations/:id/cancel
// @access  Private (customer, admin, receptionist)
exports.cancelRegistration = async (req, res) => {
  try {
    const registration = await ServiceRegistration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ message: 'Không tìm thấy đăng ký dịch vụ' });
    }
    
    // Kiểm tra quyền hủy
    const isAdmin = req.user.role === 'admin';
    const isReceptionist = req.user.role === 'receptionist';
    const isCustomer = req.user.role === 'customer';
    
    if (!isAdmin && !isReceptionist && !isCustomer) {
      return res.status(403).json({ message: 'Bạn không có quyền hủy đăng ký này' });
    }
    
    if (isCustomer) {
      // Tìm thông tin khách hàng
      const customer = await Customer.findOne({ user: req.user.id });
      
      if (!customer || !customer._id.equals(registration.customer)) {
        return res.status(403).json({ message: 'Bạn không có quyền hủy đăng ký này' });
      }
    }
    
    // Chỉ cho phép hủy nếu trạng thái là 'pending' hoặc 'approved'
    if (!['pending', 'approved'].includes(registration.status)) {
      return res.status(400).json({ 
        message: 'Chỉ có thể hủy đăng ký đang chờ duyệt hoặc đã được duyệt' 
      });
    }
    
    // Cập nhật trạng thái
    registration.status = 'canceled';
    registration.endDate = new Date();
    
    await registration.save();
    
    // Populate thông tin để trả về
    await registration.populate([
      {
        path: 'customer',
        populate: { path: 'user', select: 'fullName email phoneNumber' }
      },
      {
        path: 'trainer',
        populate: { path: 'user', select: 'fullName' }
      },
      'service',
      'workSchedule'
    ]);
    
    res.json(registration);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};