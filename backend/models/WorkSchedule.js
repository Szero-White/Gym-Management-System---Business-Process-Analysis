const mongoose = require('mongoose');

const WorkScheduleSchema = new mongoose.Schema({
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: true
  },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  note: {
    type: String
  }
}, {
  timestamps: true
});

// Đảm bảo mỗi huấn luyện viên không thể tạo lịch trùng về thời gian trong cùng một ngày
WorkScheduleSchema.index({ trainer: 1, dayOfWeek: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('WorkSchedule', WorkScheduleSchema);