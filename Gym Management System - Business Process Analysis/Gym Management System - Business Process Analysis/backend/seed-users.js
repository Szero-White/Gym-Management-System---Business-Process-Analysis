const mongoose = require('mongoose');

const users = [
  { username: 'Manager', password: '111222', email: 'manager@gym.com', fullName: 'Quan Ly', phoneNumber: '0900000001', role: 'admin' },
  { username: 'letan1', password: '111222', email: 'letan1@gym.com', fullName: 'Le Tan 1', phoneNumber: '0900000002', role: 'receptionist' },
  { username: 'vanbhlv', password: '111222', email: 'vanbhlv@gym.com', fullName: 'Van BHLV', phoneNumber: '0900000003', role: 'trainer' },
  { username: 'nguyenvana', password: '111222', email: 'nguyenvana@gym.com', fullName: 'Nguyen Van A', phoneNumber: '0900000004', role: 'customer' }
];

async function seedUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/gym-management');
    console.log('Connected to MongoDB');

    const userSchema = new mongoose.Schema({
      username: String,
      password: String,
      email: String,
      fullName: String,
      phoneNumber: String,
      role: String,
      date: { type: Date, default: Date.now }
    });

    const User = mongoose.model('User', userSchema);

    // Xoa users cu
    await User.deleteMany({});
    console.log('Deleted old users');

    // Tao users moi - KHONG hash password (plain text nhu backend mong doi)
    for (const userData of users) {
      const user = new User({
        ...userData
        // password giu nguyen plain text: "111222"
      });
      
      await user.save();
      console.log(`Created: ${userData.username} (${userData.role})`);
    }

    console.log('\n✅ All 4 users created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedUsers();
