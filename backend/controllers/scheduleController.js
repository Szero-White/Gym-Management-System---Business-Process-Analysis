const { validationResult } = require('express-validator');
const Trainer = require('../models/Trainer');
const WorkSchedule = require('../models/WorkSchedule');
// @desc    Lấy lịch làm việc của huấn luyện viên
// @route   GET /api/schedule/:trainerId
// @access  Private (trainer, admin, receptionist)
exports.getSchedule = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.trainerId);
    
    if (!trainer) {
      return res.status(404).json({ message: 'Không tìm thấy huấn luyện viên' });
    }
    
    // Kiểm tra quyền truy cập - chỉ admin, lễ tân hoặc chính huấn luyện viên đó mới có quyền xem
    if (req.user.role !== 'admin' && req.user.role !== 'receptionist') {
      // Lấy thông tin trainer để kiểm tra
      const trainerUser = await Trainer.findOne({ user: req.user.id });
      
      if (!trainerUser || trainerUser._id.toString() !== req.params.trainerId) {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
      }
    }
    
    res.json({ schedule: trainer.availability || [], trainerId: trainer._id });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy huấn luyện viên' });
    }
    
    res.status(500).send('Lỗi server');
  }
};

// @desc    Cập nhật lịch làm việc của huấn luyện viên
// @route   PUT /api/schedule/:trainerId
// @access  Private (trainer, admin)
exports.updateSchedule = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const trainer = await Trainer.findById(req.params.trainerId);
    
    if (!trainer) {
      return res.status(404).json({ message: 'Không tìm thấy huấn luyện viên' });
    }
    
    // Kiểm tra quyền - chỉ admin hoặc chính huấn luyện viên đó mới có quyền cập nhật
    if (req.user.role !== 'admin') {
      const trainerUser = await Trainer.findOne({ user: req.user.id });
      
      if (!trainerUser || trainerUser._id.toString() !== req.params.trainerId) {
        return res.status(403).json({ message: 'Không có quyền cập nhật lịch làm việc' });
      }
    }
    
    // Cập nhật lịch làm việc
    trainer.availability = req.body.schedule;
    await trainer.save();
    
    res.json({ schedule: trainer.availability });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy huấn luyện viên' });
    }
    
    res.status(500).send('Lỗi server');
  }
};

// @desc    Xóa lịch làm việc của huấn luyện viên
// @route   DELETE /api/schedule/:trainerId/:scheduleId
// @access  Private (trainer, admin)
exports.deleteScheduleItem = async (req, res) => {
  try {
    console.log('Delete schedule request:', {
      trainerId: req.params.trainerId,
      scheduleId: req.params.scheduleId,
      user: {
        id: req.user.id,
        role: req.user.role
      }
    });
    
    const trainer = await Trainer.findById(req.params.trainerId);
    
    if (!trainer) {
      console.log('Trainer not found with ID:', req.params.trainerId);
      return res.status(404).json({ message: 'Không tìm thấy huấn luyện viên' });
    }
    
    // Kiểm tra quyền - chỉ admin hoặc chính huấn luyện viên đó mới có quyền xóa
    if (req.user.role !== 'admin') {
      const trainerUser = await Trainer.findOne({ user: req.user.id });
      
      console.log('Current trainer user:', trainerUser ? trainerUser._id : 'None');
      
      if (!trainerUser) {
        return res.status(404).json({ message: 'Không tìm thấy thông tin huấn luyện viên đang đăng nhập' });
      }
      
      if (trainerUser._id.toString() !== req.params.trainerId) {
        return res.status(403).json({ 
          message: 'Không có quyền xóa lịch làm việc',
          yourId: trainerUser._id.toString(),
          requestedId: req.params.trainerId
        });
      }
    }
    
    // Tìm và xóa lịch làm việc theo ID
    console.log('Looking for schedule ID:', req.params.scheduleId);
    console.log('Available schedules:', trainer.availability.map(s => s._id.toString()));
    
    const scheduleIndex = trainer.availability.findIndex(
      item => item._id.toString() === req.params.scheduleId
    );
    
    if (scheduleIndex === -1) {
      return res.status(404).json({ message: 'Không tìm thấy lịch làm việc' });
    }
    
    // Lưu thông tin lịch làm việc trước khi xóa để tìm trong WorkSchedule
    const scheduleToDelete = trainer.availability[scheduleIndex];
    
    // Xóa từ trainer.availability
    trainer.availability.splice(scheduleIndex, 1);
    await trainer.save();
    
    // THÊM MỚI: Xóa khỏi bảng WorkSchedule
    const workSchedule = await WorkSchedule.findOne({
      trainer: trainer._id,
      dayOfWeek: scheduleToDelete.day,
      startTime: scheduleToDelete.startTime,
      endTime: scheduleToDelete.endTime
    });
    
    if (workSchedule) {
      await workSchedule.remove();
      console.log('Đã xóa lịch làm việc từ WorkSchedule');
    }
    
    res.json({ message: 'Đã xóa lịch làm việc', schedule: trainer.availability });
  } catch (err) {
    console.error('Error in deleteScheduleItem:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy huấn luyện viên hoặc lịch làm việc' });
    }
    
    res.status(500).send('Lỗi server');
  }
};

exports.addScheduleItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { day, startTime, endTime } = req.body;
  
  try {
    console.log('Request params:', req.params);
    console.log('User ID from token:', req.user.id);
    console.log('User role:', req.user.role);
    
    // Tìm thông tin huấn luyện viên
    let trainer;
    
    // Nếu người dùng là admin hoặc lễ tân, tìm theo trainerId từ params
    if (req.user.role === 'admin' || req.user.role === 'receptionist') {
      trainer = await Trainer.findById(req.params.trainerId);
    } 
    // Nếu người dùng là huấn luyện viên, tìm theo user ID
    else if (req.user.role === 'trainer') {
      trainer = await Trainer.findOne({ user: req.user.id });
    }
    
    console.log('Tìm thấy huấn luyện viên:', trainer);
    
    if (!trainer) {
      return res.status(404).json({ message: 'Không tìm thấy huấn luyện viên' });
    }
    
    // Kiểm tra quyền - chỉ admin hoặc chính huấn luyện viên đó mới có quyền thêm
    if (req.user.role !== 'admin' && req.user.role !== 'receptionist') {
      // Nếu người dùng là huấn luyện viên, kiểm tra xem có phải chính họ không
      if (req.user.role === 'trainer') {
        if (trainer.user.toString() !== req.user.id) {
          return res.status(403).json({ message: 'Không có quyền thêm lịch làm việc' });
        }
      } else {
        // Nếu không phải admin, lễ tân hay huấn luyện viên thì không có quyền
        return res.status(403).json({ message: 'Không có quyền thêm lịch làm việc' });
      }
    }
    
    // Kiểm tra xung đột lịch làm việc
    const conflictingSchedule = trainer.availability.find(
      item => item.day === day && 
      ((startTime >= item.startTime && startTime < item.endTime) || 
       (endTime > item.startTime && endTime <= item.endTime) ||
       (startTime <= item.startTime && endTime >= item.endTime))
    );
    
    if (conflictingSchedule) {
      return res.status(400).json({ 
        message: 'Lịch làm việc xung đột với lịch đã có' 
      });
    }
    
    // Thêm lịch làm việc mới vào trainer.availability
    const newScheduleItem = {
      day,
      startTime,
      endTime
    };
    
    trainer.availability.push(newScheduleItem);
    await trainer.save();
    
    // THÊM MỚI: Đồng bộ với bảng WorkSchedule
    const newWorkSchedule = new WorkSchedule({
      trainer: trainer._id,
      dayOfWeek: day,
      startTime: startTime,
      endTime: endTime,
      isAvailable: true,
      note: ''
    });
    
    await newWorkSchedule.save();
    
    res.status(201).json({ 
      message: 'Đã thêm lịch làm việc mới',
      scheduleItem: trainer.availability[trainer.availability.length - 1],
      workSchedule: newWorkSchedule  // Trả về thông tin WorkSchedule đã thêm
    });
  } catch (err) {
    console.error('Lỗi trong addScheduleItem:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy huấn luyện viên' });
    }
    
    res.status(500).send('Lỗi server');
  }
};

// @desc    Đồng bộ lịch từ trainer.availability sang work_schedules
// @route   POST /api/schedule/sync
// @access  Private (trainer, admin)
exports.syncScheduleToWorkSchedule = async (req, res) => {
  try {
    // Xác định trainer ID
    let trainerId;
    
    if (req.user.role === 'trainer') {
      // Nếu là huấn luyện viên, lấy trainer ID từ user hiện tại
      const trainer = await Trainer.findOne({ user: req.user.id });
      
      if (!trainer) {
        return res.status(404).json({ message: 'Không tìm thấy thông tin huấn luyện viên' });
      }
      
      trainerId = trainer._id;
    } else if (req.params.trainerId) {
      // Nếu là admin và có trainerId trong params
      trainerId = req.params.trainerId;
    } else {
      return res.status(400).json({ message: 'Thiếu thông tin huấn luyện viên' });
    }
    
    // Lấy thông tin huấn luyện viên
    const trainer = await Trainer.findById(trainerId);
    
    if (!trainer) {
      return res.status(404).json({ message: 'Không tìm thấy huấn luyện viên' });
    }
    
    // Lấy tất cả lịch làm việc hiện tại
    const existingSchedules = await WorkSchedule.find({ trainer: trainerId });
    
    // Danh sách các lịch đã được thêm
    const addedSchedules = [];
    
    // Duyệt qua từng availability và thêm vào work_schedules
    for (const item of trainer.availability) {
      // Kiểm tra xem lịch này đã tồn tại trong WorkSchedule chưa
      const existingSchedule = existingSchedules.find(schedule => 
        schedule.dayOfWeek === item.day && 
        schedule.startTime === item.startTime && 
        schedule.endTime === item.endTime
      );
      
      // Nếu chưa tồn tại, thêm mới
      if (!existingSchedule) {
        const newSchedule = new WorkSchedule({
          trainer: trainerId,
          dayOfWeek: item.day,
          startTime: item.startTime,
          endTime: item.endTime,
          isAvailable: true,
          note: ''
        });
        
        await newSchedule.save();
        addedSchedules.push(newSchedule);
      }
    }
    
    res.json({ 
      message: `Đã đồng bộ ${addedSchedules.length} lịch làm việc thành công`, 
      addedSchedules 
    });
  } catch (err) {
    console.error('Lỗi trong syncScheduleToWorkSchedule:', err);
    res.status(500).send('Lỗi server');
  }
};

// @desc    Lấy lịch làm việc của huấn luyện viên đang đăng nhập
// @route   GET /api/schedule/me
// @access  Private (trainer)
exports.getMySchedule = async (req, res) => {
  try {
    // Kiểm tra người dùng có phải là huấn luyện viên không
    if (req.user.role !== 'trainer') {
      return res.status(403).json({ message: 'Chỉ huấn luyện viên mới có quyền truy cập' });
    }
    
    const trainer = await Trainer.findOne({ user: req.user.id });
    
    if (!trainer) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin huấn luyện viên' });
    }
    
    // Return the trainer ID in the response so the frontend knows it
    res.json({ 
      schedule: trainer.availability || [], 
      trainerId: trainer._id // Include the actual trainerId in the response
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};