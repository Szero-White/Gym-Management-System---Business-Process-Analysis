const { validationResult } = require('express-validator');
const Service = require('../models/Service');
const ServiceRegistration = require('../models/ServiceRegistration');
const Trainer = require('../models/Trainer');

// @desc    Lấy tất cả dịch vụ
// @route   GET /api/services
// @access  Public
exports.getAllServices = async (req, res) => {
  try {
    // Thêm query parameter để lọc theo trainerId nếu có
    const filterOptions = { isActive: true };

    if (req.query.trainerId) {
      filterOptions.trainerId = req.query.trainerId;
    }

    const services = await Service.find(filterOptions)
      .sort({ category: 1, price: 1 })
      .populate({
        path: 'trainerId',
        populate: {
          path: 'user',
          select: 'fullName'
        }
      });
    
    res.json(services);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// @desc    Lấy dịch vụ theo ID
// @route   GET /api/services/:id
// @access  Public
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate({
        path: 'trainerId',
        populate: {
          path: 'user',
          select: 'fullName'
        }
      });
    
    if (!service) {
      return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    }
    
    res.json(service);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    }
    
    res.status(500).send('Lỗi server');
  }
};

// @desc    Thêm dịch vụ mới
// @route   POST /api/services
// @access  Private (admin or trainer)
// Trong hàm addService
exports.addService = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { name, description, price, duration, category, isActive, trainerId } = req.body;
  
  try {
    // Kiểm tra xem dịch vụ đã tồn tại chưa
    const existingService = await Service.findOne({ name });
    if (existingService) {
      return res.status(400).json({ message: 'Dịch vụ với tên này đã tồn tại' });
    }

    // Nếu có trainerId, kiểm tra xem trainer có tồn tại không
    let actualTrainerId = trainerId;
    if (req.user.role === 'trainer') {
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (trainer) {
        actualTrainerId = trainer._id;
      }
    }
    
    const newService = new Service({
      name,
      description,
      price,
      duration,
      category: category || 'personal',
      isActive: isActive !== undefined ? isActive : true,
      trainerId: actualTrainerId
    });
    
    const service = await newService.save();
    
    // Populate trainer information để trả về đầy đủ thông tin
    await service.populate({
      path: 'trainerId',
      populate: {
        path: 'user',
        select: 'fullName'
      }
    });
    
    res.status(201).json(service);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// @desc    Cập nhật dịch vụ
// @route   PUT /api/services/:id
// @access  Private (admin or trainer who owns the service)
exports.updateService = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { name, description, price, duration, category, isActive } = req.body;
  
  try {
    let service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    }
    
    // Kiểm tra quyền cập nhật - chỉ admin hoặc trainer sở hữu dịch vụ có quyền
    if (req.user.role === 'trainer') {
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer || (service.trainerId && service.trainerId.toString() !== trainer._id.toString())) {
        return res.status(403).json({ message: 'Bạn không có quyền cập nhật dịch vụ này' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    
    // Kiểm tra xem tên dịch vụ đã tồn tại chưa (nếu tên bị thay đổi)
    if (name && name !== service.name) {
      const existingService = await Service.findOne({ name });
      if (existingService) {
        return res.status(400).json({ message: 'Dịch vụ với tên này đã tồn tại' });
      }
    }
    
    // Nếu đang vô hiệu hóa dịch vụ, kiểm tra xem có đăng ký nào đang chờ hoặc đã duyệt không
    if (isActive === false && service.isActive === true) {
      const pendingRegistrations = await ServiceRegistration.find({
        service: service._id,
        status: { $in: ['pending', 'approved'] }
      });
      
      if (pendingRegistrations.length > 0) {
        return res.status(400).json({
          message: 'Không thể vô hiệu hóa dịch vụ này vì đang có đăng ký'
        });
      }
    }
    
    // Cập nhật thông tin
    if (name) service.name = name;
    if (description) service.description = description;
    if (price !== undefined) service.price = price;
    if (duration) service.duration = duration;
    if (category) service.category = category;
    if (isActive !== undefined) service.isActive = isActive;
    
    await service.save();
    
    res.json(service);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    }
    
    res.status(500).send('Lỗi server');
  }
};

// @desc    Xóa dịch vụ (vô hiệu hóa)
// @route   DELETE /api/services/:id
// @access  Private (admin or trainer who owns the service)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    }
    
    // Kiểm tra quyền xóa - chỉ admin hoặc trainer sở hữu dịch vụ có quyền
    if (req.user.role === 'trainer') {
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer || (service.trainerId && service.trainerId.toString() !== trainer._id.toString())) {
        return res.status(403).json({ message: 'Bạn không có quyền xóa dịch vụ này' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    
    // Kiểm tra xem có đăng ký nào đang chờ hoặc đã duyệt không
    const pendingRegistrations = await ServiceRegistration.find({
      service: service._id,
      status: { $in: ['pending', 'approved'] }
    });
    
    if (pendingRegistrations.length > 0) {
      return res.status(400).json({
        message: 'Không thể xóa dịch vụ này vì đang có đăng ký'
      });
    }
    
    // Thay vì xóa, chỉ vô hiệu hóa dịch vụ
    service.isActive = false;
    await service.save();
    
    res.json({ message: 'Dịch vụ đã được vô hiệu hóa' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    }
    
    res.status(500).send('Lỗi server');
  }
};

// @desc    Lấy dịch vụ do huấn luyện viên cung cấp
// @route   GET /api/services/trainer/:trainerId
// @access  Public
exports.getTrainerServices = async (req, res) => {
  try {
    const services = await Service.find({ 
      trainerId: req.params.trainerId,
      isActive: true 
    })
    .sort({ category: 1, price: 1 });
    
    res.json(services);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy huấn luyện viên' });
    }
    
    res.status(500).send('Lỗi server');
  }
};