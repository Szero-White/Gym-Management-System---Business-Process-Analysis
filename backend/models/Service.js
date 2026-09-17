const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number, // Thời lượng tính bằng phút
    required: true,
    min: 1
  },
  category: {
    type: String,
    enum: ['personal', 'group', 'special'],
    default: 'personal'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', ServiceSchema);