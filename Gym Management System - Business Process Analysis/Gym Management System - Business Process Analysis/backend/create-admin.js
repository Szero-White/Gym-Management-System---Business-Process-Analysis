const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');

    try {
      // Xóa tài khoản admin cũ nếu có
      await User.deleteOne({ username: 'admin' });
      console.log('Đã xóa tài khoản admin cũ (nếu có)');

      // Tạo tài khoản admin mới với mật khẩu không hash
      const admin = new User({
        username: 'admin',
        password: 'admin123', // Mật khẩu lưu trực tiếp
        email: 'admin@example.com',
        fullName: 'System Administrator',
        phoneNumber: '0123456789',
        role: 'admin',
        active: true
      });

      await admin.save();
      console.log('Tài khoản admin đã được tạo thành công:');
      console.log({
        username: admin.username,
        password: admin.password, // Hiển thị mật khẩu để kiểm tra
        email: admin.email,
        role: admin.role
      });
    } catch (error) {
      console.error('Lỗi khi tạo tài khoản admin:', error.message);
    } finally {
      // Đóng kết nối
      mongoose.connection.close();
      console.log('Đã đóng kết nối MongoDB');
    }
  })
  .catch(err => {
    console.error('Lỗi kết nối MongoDB:', err);
    process.exit(1);
  });