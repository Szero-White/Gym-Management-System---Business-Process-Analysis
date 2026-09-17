const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  serialNumber: {
    type: String,
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'in-use', 'damaged', 'maintenance', 'retired'],
    default: 'new'
  },
  description: {
    type: String,
    trim: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  warrantyEndDate: {
    type: Date
  },
  cost: {
    type: Number
  },
  location: {
    type: String,
    trim: true
  },
  image: {
    type: String // path to the image file
  },
  lastMaintenanceDate: {
    type: Date
  },
  nextMaintenanceDate: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Equipment', EquipmentSchema);