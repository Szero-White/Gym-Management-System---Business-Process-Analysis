const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Trainer = require('../models/Trainer');

// Đăng ký tài khoản
exports.register = async (req, res) => {
  // Kiểm tra lỗi validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { username, password, email, fullName, phoneNumber, role } = req.body;
  
  try {
    // Kiểm tra nếu người dùng đã tồn tại
    let user = await User.findOne({ $or: [{ email }, { username }] });
    
    if (user) {
      return res.status(400).json({ 
        message: 'Tài khoản đã tồn tại với email hoặc username này' 
      });
    }
    
    // Kiểm tra quyền đăng ký
    if (req.user && req.user.role === 'receptionist' && (role === 'admin' || role === 'receptionist')) {
      return res.status(403).json({ 
        message: 'Lễ tân không thể đăng ký tài khoản cho nhân viên' 
      });
    }
    
    // Tạo user mới
    user = new User({
      username,
      password, // Store password as-is (no hashing)
      email,
      fullName,
      phoneNumber,
      role
    });
    
    await user.save();
    
    // Nếu role là customer, tạo thêm thông tin customer
    if (role === 'customer') {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // Mặc định là 1 tháng
      
      const customer = new Customer({
        user: user._id,
        membershipEndDate: endDate
      });
      
      await customer.save();
    }
    
    // Nếu role là trainer, tạo thêm thông tin trainer
    if (role === 'trainer') {
      const trainer = new Trainer({
        user: user._id
      });
      
      await trainer.save();
    }
    
    // Tạo token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { username, password } = req.body;
  
  try {
    // Kiểm tra username
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(400).json({ message: 'Thông tin đăng nhập không chính xác' });
    }
    
    // Kiểm tra password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Thông tin đăng nhập không chính xác' });
    }
    
    // Kiểm tra tài khoản có đang active không
    if (!user.active) {
      return res.status(400).json({ message: 'Tài khoản đã bị vô hiệu hóa' });
    }
    
    // Tạo token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.role
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};

// Lấy thông tin người dùng hiện tại
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi server');
  }
};