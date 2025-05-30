const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  Role_Name: {
    type: String,
    required: [true, 'Tên vai trò là bắt buộc'],
    unique: true,
    trim: true
  },
  Role_Description: {
    type: String,
    trim: true
  },
  Permissions: [{
    type: String,
    enum: [
      'read:products',
      'write:products',
      'read:categories',
      'write:categories',
      'read:users',
      'write:users',
      'read:orders',
      'write:orders',
      'read:roles',
      'write:roles'
    ]
  }],
  Status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Tạo index cho tìm kiếm
roleSchema.index({ Role_Name: 'text' });

const Role = mongoose.model('Role', roleSchema);

module.exports = Role; 