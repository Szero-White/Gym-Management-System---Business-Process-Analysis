const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'trainer', 'receptionist', 'customer'],
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  profileImage: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// So sánh mật khẩu
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Direct password comparison (no hashing)
    return candidatePassword === this.password;
  } catch (error) {
    return false;
  }
};

module.exports = mongoose.model('User', UserSchema);