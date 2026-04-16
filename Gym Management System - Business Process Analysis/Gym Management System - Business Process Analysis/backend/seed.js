const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

// Cấu hình dotenv
dotenv.config();

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB connected');

  // Kiểm tra nếu đã có admin
  const adminExists = await User.findOne({ role: 'admin' });
  
  if (adminExists) {
    console.log('Admin account already exists');
    mongoose.connection.close();
    return;
  }

  // Tạo mật khẩu đã hash
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);

  // Tạo admin
  const admin = new User({
    username: 'admin',
    password: hashedPassword,
    email: 'admin@example.com',
    fullName: 'Administrator',
    phoneNumber: '0123456789',
    role: 'admin'
  });

  await admin.save();
  console.log('Admin account created successfully');
  
  mongoose.connection.close();
})
.catch(err => {
  console.error('Error connecting to MongoDB', err);
  process.exit(1);
});