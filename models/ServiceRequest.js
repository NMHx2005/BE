const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  FullName: {
    type: String,
    required: true,
    trim: true
  },
  Phone: {
    type: String,
    required: true,
    match: [/^[0-9]{10}$/, 'Số điện thoại không hợp lệ']
  },
  Email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  CarModel: {
    type: String,
    required: true,
    trim: true
  },
  AppointmentDate: {
    type: Date,
    required: true
  },
  AppointmentTime: {
    type: String,
    required: true,
    enum: ['08:00', '10:00', '13:00', '15:00', '17:00'] // Ví dụ các khung giờ
  },
  ServiceType: {
    type: String,
    required: true,
    enum: ['Bảo dưỡng định kỳ', 'Sửa chữa', 'Đánh son', 'Nâng cấp hiệu suất', 'Khác']
  },
  Status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  Notes: {
    type: String
  }
}, { timestamps: true });

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

module.exports = ServiceRequest; 