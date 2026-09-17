const User = require('../models/User');
const Customer = require('../models/Customer');
const Trainer = require('../models/Trainer');
const { validationResult } = require('express-validator');

// Lấy danh sách tất cả khách hàng
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .populate({
        path: 'user',
        select: 'username email fullName phoneNumber active profileImage'
      })
      .populate({
        path: 'assignedTrainer',
        populate: {
          path: 'user',
          select: 'fullName'
        }
      });
      
    res.json(customers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// Activate trainer account
exports.activateTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    
    if (!trainer) {
      return res.status(404).json({ message: 'Không tìm thấy huấn luyện viên' });
    }
    
    const user = await User.findById(trainer.user);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản người dùng' });
    }
    
    user.active = true;
    await user.save();
    
    res.json({ message: 'Kích hoạt tài khoản thành công' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// Deactivate trainer account (not delete)
exports.deactivateTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    
    if (!trainer) {
      return res.status(404).json({ message: 'Không tìm thấy huấn luyện viên' });
    }
    
    const user = await User.findById(trainer.user);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản người dùng' });
    }
    
    user.active = false;
    await user.save();
    
    res.json({ message: 'Vô hiệu hóa tài khoản thành công' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// Lấy danh sách tất cả huấn luyện viên
exports.getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find()
      .populate({
        path: 'user',
        select: 'username email fullName phoneNumber active profileImage'
      });
      
    res.json(trainers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// Thêm khách hàng mới
exports.addCustomer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { 
    username, 
    password, 
    email, 
    fullName, 
    phoneNumber, 
    membershipType, 
    membershipEndDate,
    healthInformation,
    trainingGoals
  } = req.body;
  
  try {
    // Kiểm tra tồn tại
    let existingUser = await User.findOne({ $or: [{ email }, { username }] });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email hoặc username đã tồn tại' });
    }
    
    // Tạo user mới
    const user = new User({
      username,
      password,
      email,
      fullName,
      phoneNumber,
      role: 'customer'
    });
    
    await user.save();
    
    // Tạo customer profile
    const customer = new Customer({
      user: user._id,
      membershipType: membershipType || 'basic',
      membershipEndDate: membershipEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      healthInformation,
      trainingGoals
    });
    
    await customer.save();
    
    res.status(201).json({ message: 'Khách hàng đã được tạo thành công', customer });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// Thêm huấn luyện viên mới
exports.addTrainer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { 
    username, 
    password, 
    email, 
    fullName, 
    phoneNumber, 
    specializations,
    experience,
    certifications,
    availability
  } = req.body;
  
  try {
    let existingUser = await User.findOne({ $or: [{ email }, { username }] });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email hoặc username đã tồn tại' });
    }
    
    const user = new User({
      username,
      password,
      email,
      fullName,
      phoneNumber,
      role: 'trainer'
    });
    
    await user.save();
    
    const trainer = new Trainer({
      user: user._id,
      specializations,
      experience,
      certifications,
      availability
    });
    
    await trainer.save();
    
    res.status(201).json({ message: 'Huấn luyện viên đã được tạo thành công', trainer });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// Cập nhật thông tin khách hàng
exports.updateCustomer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { 
    fullName, 
    phoneNumber, 
    email,
    membershipType, 
    membershipEndDate,
    healthInformation,
    trainingGoals
  } = req.body;
  
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }
    
    const user = await User.findById(customer.user);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản người dùng' });
    }
    
    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (email) user.email = email;
    
    await user.save();
    
    if (membershipType) customer.membershipType = membershipType;
    if (membershipEndDate) customer.membershipEndDate = membershipEndDate;
    if (healthInformation) customer.healthInformation = healthInformation;
    if (trainingGoals) customer.trainingGoals = trainingGoals;
    
    await customer.save();
    
    res.json({ message: 'Cập nhật thông tin khách hàng thành công', customer });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// Cập nhật thông tin huấn luyện viên
exports.updateTrainer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { 
    fullName, 
    phoneNumber, 
    email,
    specializations,
    experience,
    certifications,
    availability
  } = req.body;
  
  try {
    const trainer = await Trainer.findById(req.params.id);
    
    if (!trainer) {
      return res.status(404).json({ message: 'Không tìm thấy huấn luyện viên' });
    }
    
    const user = await User.findById(trainer.user);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản người dùng' });
    }
    
    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (email) user.email = email;
    
    await user.save();
    
    if (specializations) trainer.specializations = specializations;
    if (experience) trainer.experience = experience;
    if (certifications) trainer.certifications = certifications;
    if (availability) trainer.availability = availability;
    
    await trainer.save();
    
    res.json({ message: 'Cập nhật thông tin huấn luyện viên thành công', trainer });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

exports.uploadTrainerProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file nào được tải lên' });
    }

    const trainer = await Trainer.findById(req.params.id);
    
    if (!trainer) {
      return res.status(404).json({ message: 'Không tìm thấy huấn luyện viên' });
    }

    const user = await User.findById(trainer.user);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản người dùng' });
    }

    // Lưu đường dẫn hình ảnh
    const profileImagePath = `/uploads/${req.file.filename}`;
    user.profileImage = profileImagePath;
    await user.save();

    res.json({ 
      message: 'Tải lên ảnh đại diện thành công',
      profileImageUrl: profileImagePath 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// Xóa khách hàng (vô hiệu hóa)
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }
    
    const user = await User.findById(customer.user);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản người dùng' });
    }
    
    user.active = false;
    await user.save();
    
    res.json({ message: 'Khách hàng đã bị vô hiệu hóa' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// Upload ảnh đại diện cho khách hàng
exports.uploadCustomerProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file nào được tải lên' });
    }

    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }

    const user = await User.findById(customer.user);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản người dùng' });
    }

    // Lưu đường dẫn hình ảnh
    const profileImagePath = `/uploads/${req.file.filename}`;
    user.profileImage = profileImagePath;
    await user.save();

    res.json({ 
      message: 'Tải lên ảnh đại diện thành công',
      profileImageUrl: profileImagePath 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// Kích hoạt tài khoản khách hàng
exports.activateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }
    
    const user = await User.findById(customer.user);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản người dùng' });
    }
    
    // Kiểm tra thời hạn thành viên
    const currentDate = new Date();
    if (new Date(customer.membershipEndDate) < currentDate) {
      return res.status(400).json({
        message: 'Không thể kích hoạt tài khoản đã hết hạn. Vui lòng gia hạn thành viên trước.'
      });
    }
    
    user.active = true;
    await user.save();
    
    res.json({ message: 'Kích hoạt tài khoản thành công' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// Tự động vô hiệu hóa tài khoản hết hạn
exports.checkExpiredMemberships = async () => {
  try {
    const currentDate = new Date();
    
    // Tìm tất cả khách hàng có membershipEndDate nhỏ hơn ngày hiện tại
    const expiredCustomers = await Customer.find({
      membershipEndDate: { $lt: currentDate }
    });
    
    // Vô hiệu hóa tài khoản của những khách hàng hết hạn
    for (const customer of expiredCustomers) {
      const user = await User.findById(customer.user);
      if (user && user.active) {
        user.active = false;
        await user.save();
        console.log(`Đã vô hiệu hóa tài khoản của khách hàng: ${user.fullName}`);
      }
    }
    
    console.log(`Đã vô hiệu hóa ${expiredCustomers.length} tài khoản hết hạn`);
  } catch (err) {
    console.error('Lỗi khi kiểm tra tài khoản hết hạn:', err);
  }
};

// Lấy thông tin chi tiết của một khách hàng
exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'username email fullName phoneNumber active profileImage'
      })
      .populate({
        path: 'assignedTrainer',
        populate: {
          path: 'user',
          select: 'fullName'
        }
      });
      
    if (!customer) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }
    
    res.json(customer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// Reset password for customer
exports.resetCustomerPassword = async (req, res) => {
  const { password } = req.body;
  
  if (!password || password.trim().length < 6) {
    return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
  }
  
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }
    
    const user = await User.findById(customer.user);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản người dùng' });
    }
    
    // Update password
    user.password = password;
    await user.save();
    
    res.json({ message: 'Cập nhật mật khẩu thành công' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// Reset password for trainer
exports.resetTrainerPassword = async (req, res) => {
  const { password } = req.body;
  
  if (!password || password.trim().length < 6) {
    return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
  }
  
  try {
    const trainer = await Trainer.findById(req.params.id);
    
    if (!trainer) {
      return res.status(404).json({ message: 'Không tìm thấy huấn luyện viên' });
    }
    
    const user = await User.findById(trainer.user);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản người dùng' });
    }
    
    // Update password
    user.password = password;
    await user.save();
    
    res.json({ message: 'Cập nhật mật khẩu thành công' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};


// Lấy thông tin chi tiết của một huấn luyện viên
exports.getTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'username email fullName phoneNumber active profileImage'
      });
      
    if (!trainer) {
      return res.status(404).json({ message: 'Không tìm thấy huấn luyện viên' });
    }
    
    res.json(trainer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};