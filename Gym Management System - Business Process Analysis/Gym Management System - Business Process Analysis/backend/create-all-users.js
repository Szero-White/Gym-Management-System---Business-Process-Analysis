const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const users = [
  { username: 'Manager', password: '111222', email: 'manager@gym.com', fullName: 'Quản Lý', phoneNumber: '0900000001', role: 'admin' },
  { username: 'letan1', password: '111222', email: 'letan1@gym.com', fullName: 'Lễ Tân 1', phoneNumber: '0900000002', role: 'receptionist' },
  { username: 'vanbhlv', password: '111222', email: 'vanbhlv@gym.com', fullName: 'Văn BHLV', phoneNumber: '0900000003', role: 'trainer' },
  { username: 'nguyenvana', password: '111222', email: 'nguyenvana@gym.com', fullName: 'Nguyễn Văn A', phoneNumber: '0900000004', role: 'customer' }
];

async function createUsers() {
  try {
    for (const userData of users) {
      await User.deleteOne({ username: userData.username });
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = new User({
        ...userData,
        password: hashedPassword,
        active: true
      });
      
      await user.save();
      console.log('Created:', userData.username, '-', userData.role);
    }
    console.log('All users created!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

createUsers();
