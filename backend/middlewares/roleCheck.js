// Middleware kiểm tra quyền
const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Không có thông tin xác thực' });
    }
    
    const hasRole = allowedRoles.includes(req.user.role);
    
    if (!hasRole) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
    }
    
    next();
  };
};

module.exports = roleCheck;