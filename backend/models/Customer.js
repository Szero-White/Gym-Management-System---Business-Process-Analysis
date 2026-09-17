const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  membershipType: {
    type: String,
    enum: ['basic', 'standard', 'premium'],
    default: 'basic'
  },
  membershipStartDate: {
    type: Date,
    default: Date.now
  },
  membershipEndDate: {
    type: Date,
    required: true
  },
  assignedTrainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    default: null
  },
  healthInformation: {
    height: Number,
    weight: Number,
    medicalConditions: [String],
    allergies: [String]
  },
  trainingGoals: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', CustomerSchema);