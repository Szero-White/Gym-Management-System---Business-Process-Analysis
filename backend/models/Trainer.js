const mongoose = require('mongoose');

const TrainerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specializations: [String],
  experience: {
    type: Number, // Số năm kinh nghiệm
    default: 0
  },
  certifications: [{
    name: String,
    issuedBy: String,
    year: Number
  }],
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: String,
    endTime: String
  }],
  customers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  }],
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Trainer', TrainerSchema);