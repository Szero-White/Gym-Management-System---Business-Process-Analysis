const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Lấy token từ header
  const token = req.header('x-auth-token');
  
  // Kiểm tra nếu không có token
  if (!token) {
    return res.status(401).json({ message: 'Không có token, xác thực bị từ chối' });
  }
  
  try {
    // Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Thêm thông tin user vào request
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};