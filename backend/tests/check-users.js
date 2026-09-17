const mongoose = require('mongoose');

async function checkUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/gym-management');
    console.log('Connected to MongoDB');
    
    const userSchema = new mongoose.Schema({
      username: String,
      password: String,
      role: String
    });
    
    const User = mongoose.model('User', userSchema);
    const users = await User.find({}, 'username role');
    
    console.log('\nUsers in database:');
    users.forEach(u => console.log(`- ${u.username} (${u.role})`));
    
    if (users.length === 0) {
      console.log('NO USERS FOUND!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
