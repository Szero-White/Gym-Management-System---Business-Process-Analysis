const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },
  maintenanceType: {
    type: String,
    enum: ['routine', 'repair', 'inspection', 'cleaning', 'other'],
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  completedDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'canceled'],
    default: 'scheduled'
  },
  technician: {
    name: String,
    contact: String
  },
  cost: {
    type: Number,
    default: 0
  },
  description: {
    type: String
  },
  notes: {
    type: String
  },
  partsReplaced: [{
    partName: String,
    partCost: Number
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Maintenance', MaintenanceSchema);