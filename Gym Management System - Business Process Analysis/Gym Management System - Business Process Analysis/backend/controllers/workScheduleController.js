const { validationResult } = require('express-validator');
const WorkSchedule = require('../models/WorkSchedule');
const Trainer = require('../models/Trainer');
const ServiceRegistration = require('../models/ServiceRegistration');

// @desc    Lấy lịch làm việc của huấn luyện viên
// @route   GET /api/work-schedules/trainer/:trainerId
// @access  Private
exports.getTrainerSchedules = async (req, res) => {
  try {
    const schedules = await WorkSchedule.find({ trainer: req.params.trainerId })
      .sort({ dayOfWeek: 1, startTime: 1 });
    
    res.json(schedules);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// @desc    Lấy lịch làm việc của huấn luyện viên đang đăng nhập
// @route   GET /api/work-schedules/my-schedules
// @access  Private (trainer)
exports.getMySchedules = async (req, res) => {
  try {
    // Tìm thông tin trainer dựa trên user ID
    const trainer = await Trainer.findOne({ user: req.user.id });
    
    if (!trainer) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin huấn luyện viên' });
    }
    
    const schedules = await WorkSchedule.find({ trainer: trainer._id })
      .sort({ dayOfWeek: 1, startTime: 1 });
    
    res.json(schedules);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// @desc    Lấy tất cả lịch làm việc có sẵn của huấn luyện viên
// @route   GET /api/work-schedules/available/:trainerId
// @access  Private
exports.getAvailableSchedules = async (req, res) => {
  try {
    const schedules = await WorkSchedule.find({ 
      trainer: req.params.trainerId,
      isAvailable: true 
    }).sort({ dayOfWeek: 1, startTime: 1 });
    
    res.json(schedules);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// @desc    Tạo lịch làm việc mới
// @route   POST /api/work-schedules
// @access  Private (trainer)
exports.createWorkSchedule = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { dayOfWeek, startTime, endTime, note } = req.body;
  
  try {
    // Tìm thông tin trainer dựa trên user ID
    const trainer = await Trainer.findOne({ user: req.user.id });
    
    if (!trainer) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin huấn luyện viên' });
    }
    
    // Kiểm tra thời gian hợp lệ
    if (startTime >= endTime) {
      return res.status(400).json({ 
        message: 'Thời gian bắt đầu phải trước thời gian kết thúc' 
      });
    }
    
    // Kiểm tra trùng lịch
    const existingSchedule = await WorkSchedule.findOne({
      trainer: trainer._id,
      dayOfWeek,
      $or: [
        // Thời gian bắt đầu nằm trong một lịch đã tồn tại
        {
          startTime: { $lte: startTime },
          endTime: { $gt: startTime }
        },
        // Thời gian kết thúc nằm trong một lịch đã tồn tại
        {
          startTime: { $lt: endTime },
          endTime: { $gte: endTime }
        },
        // Lịch mới bao trùm một lịch đã tồn tại
        {
          startTime: { $gte: startTime },
          endTime: { $lte: endTime }
        }
      ]
    });
    
    if (existingSchedule) {
      return res.status(400).json({ 
        message: 'Lịch làm việc này trùng với lịch đã tồn tại' 
      });
    }
    
    const newSchedule = new WorkSchedule({
      trainer: trainer._id,
      dayOfWeek,
      startTime,
      endTime,
      note
    });
    
    const schedule = await newSchedule.save();
    res.status(201).json(schedule);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// @desc    Cập nhật lịch làm việc
// @route   PUT /api/work-schedules/:id
// @access  Private (trainer)
exports.updateWorkSchedule = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { dayOfWeek, startTime, endTime, isAvailable, note } = req.body;
  
  try {
    // Tìm lịch làm việc
    let schedule = await WorkSchedule.findById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({ message: 'Không tìm thấy lịch làm việc' });
    }
    
    // Tìm thông tin trainer dựa trên user ID
    const trainer = await Trainer.findOne({ user: req.user.id });
    
    if (!trainer || !trainer._id.equals(schedule.trainer)) {
      return res.status(403).json({ 
        message: 'Bạn không có quyền cập nhật lịch làm việc này' 
      });
    }
    
    // Kiểm tra xem lịch đã được đăng ký chưa
    if (isAvailable === false) {
      const registrations = await ServiceRegistration.find({
        workSchedule: schedule._id,
        status: { $in: ['pending', 'approved'] }
      });
      
      if (registrations.length > 0) {
        return res.status(400).json({
          message: 'Không thể thay đổi trạng thái vì lịch này đã có đăng ký'
        });
      }
    }
    
    // Cập nhật thông tin lịch
    if (dayOfWeek) schedule.dayOfWeek = dayOfWeek;
    if (startTime && endTime) {
      // Kiểm tra thời gian hợp lệ
      if (startTime >= endTime) {
        return res.status(400).json({ 
          message: 'Thời gian bắt đầu phải trước thời gian kết thúc' 
        });
      }
      
      // Kiểm tra trùng lịch (trừ lịch hiện tại)
      const existingSchedule = await WorkSchedule.findOne({
        _id: { $ne: req.params.id },
        trainer: trainer._id,
        dayOfWeek: dayOfWeek || schedule.dayOfWeek,
        $or: [
          {
            startTime: { $lte: startTime },
            endTime: { $gt: startTime }
          },
          {
            startTime: { $lt: endTime },
            endTime: { $gte: endTime }
          },
          {
            startTime: { $gte: startTime },
            endTime: { $lte: endTime }
          }
        ]
      });
      
      if (existingSchedule) {
        return res.status(400).json({ 
          message: 'Lịch làm việc này trùng với lịch đã tồn tại' 
        });
      }
      
      schedule.startTime = startTime;
      schedule.endTime = endTime;
    }
    
    if (isAvailable !== undefined) schedule.isAvailable = isAvailable;
    if (note !== undefined) schedule.note = note;
    
    await schedule.save();
    
    res.json(schedule);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// @desc    Xóa lịch làm việc
// @route   DELETE /api/work-schedules/:id
// @access  Private (trainer)
exports.deleteWorkSchedule = async (req, res) => {
  try {
    // Tìm lịch làm việc
    const schedule = await WorkSchedule.findById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({ message: 'Không tìm thấy lịch làm việc' });
    }
    
    // Tìm thông tin trainer dựa trên user ID
    const trainer = await Trainer.findOne({ user: req.user.id });
    
    if (!trainer || !trainer._id.equals(schedule.trainer)) {
      return res.status(403).json({ 
        message: 'Bạn không có quyền xóa lịch làm việc này' 
      });
    }
    
    // Kiểm tra xem lịch đã được đăng ký chưa
    const registrations = await ServiceRegistration.find({
      workSchedule: schedule._id,
      status: { $in: ['pending', 'approved'] }
    });
    
    if (registrations.length > 0) {
      return res.status(400).json({
        message: 'Không thể xóa lịch này vì đã có đăng ký'
      });
    }
    
    await schedule.remove();
    
    res.json({ message: 'Lịch làm việc đã được xóa' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};