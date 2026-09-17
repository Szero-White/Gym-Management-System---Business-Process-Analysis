const { validationResult } = require('express-validator');
const User = require('../models/User');

// Get all staff members (admins and receptionists)
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({
      role: { $in: ['admin', 'receptionist'] }
    }).select('-password');
    
    res.json(staff);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// Get staff member by ID
exports.getStaffById = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id).select('-password');
    
    if (!staff || !['admin', 'receptionist'].includes(staff.role)) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    
    res.json(staff);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    
    res.status(500).send('Lỗi server');
  }
};

// Add new staff member
exports.addStaff = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { username, password, email, fullName, phoneNumber, role } = req.body;
  
  // Verify role is valid for staff
  if (!['admin', 'receptionist'].includes(role)) {
    return res.status(400).json({ message: 'Vai trò không hợp lệ' });
  }
  
  try {
    // Check if user already exists
    let existingUser = await User.findOne({ $or: [{ email }, { username }] });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email hoặc username đã tồn tại' });
    }
    
    // Create new user (without hashing password)
    const newStaff = new User({
      username,
      password, // Store password as-is
      email,
      fullName,
      phoneNumber,
      role
    });
    
    await newStaff.save();
    
    res.status(201).json({ 
      message: 'Thêm nhân viên thành công',
      staff: {
        id: newStaff._id,
        username: newStaff.username,
        email: newStaff.email,
        fullName: newStaff.fullName,
        role: newStaff.role
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// Update staff member
exports.updateStaff = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { email, fullName, phoneNumber, password } = req.body;
  
  try {
    const staff = await User.findById(req.params.id);
    
    if (!staff || !['admin', 'receptionist'].includes(staff.role)) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    
    // Don't allow updating the main admin
    if (staff.username === 'admin' && staff.role === 'admin') {
      return res.status(400).json({ message: 'Không thể chỉnh sửa tài khoản admin chính' });
    }
    
    // Update fields
    if (email) staff.email = email;
    if (fullName) staff.fullName = fullName;
    if (phoneNumber) staff.phoneNumber = phoneNumber;
    if (password) {
      staff.password = password; // Update password directly
    }
    
    await staff.save();
    
    res.json({ 
      message: 'Cập nhật thông tin nhân viên thành công',
      staff: {
        id: staff._id,
        username: staff.username,
        email: staff.email,
        fullName: staff.fullName,
        role: staff.role
      }
    });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    
    res.status(500).send('Lỗi server');
  }
};

// Activate staff account
exports.activateStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);
    
    if (!staff || !['admin', 'receptionist'].includes(staff.role)) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    
    staff.active = true;
    await staff.save();
    
    res.json({ message: 'Kích hoạt tài khoản thành công' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    
    res.status(500).send('Lỗi server');
  }
};

// ... các hàm khác giữ nguyên

// Upload ảnh đại diện cho nhân viên
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file nào được tải lên' });
    }

    const staff = await User.findById(req.params.id);
    
    if (!staff || !['admin', 'receptionist'].includes(staff.role)) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    
    // Lưu đường dẫn hình ảnh
    const profileImagePath = `/uploads/${req.file.filename}`;
    staff.profileImage = profileImagePath;
    await staff.save();

    res.json({ 
      message: 'Tải lên ảnh đại diện thành công',
      profileImageUrl: profileImagePath 
    });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    
    res.status(500).send('Lỗi server');
  }
};

// ... các hàm khác giữ nguyên

// Deactivate staff account
exports.deactivateStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);
    
    if (!staff || !['admin', 'receptionist'].includes(staff.role)) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    
    // Don't allow deactivating the main admin
    if (staff.username === 'admin' && staff.role === 'admin') {
      return res.status(400).json({ message: 'Không thể vô hiệu hóa tài khoản admin chính' });
    }
    
    staff.active = false;
    await staff.save();
    
    res.json({ message: 'Vô hiệu hóa tài khoản thành công' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    
    res.status(500).send('Lỗi server');
  }
};