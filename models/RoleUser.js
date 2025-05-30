const mongoose = require('mongoose');

const roleUserSchema = new mongoose.Schema({
  UserID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID người dùng là bắt buộc']
  },
  RoleID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: [true, 'ID vai trò là bắt buộc']
  },
  Status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Tạo compound index để đảm bảo tính duy nhất của cặp UserID-RoleID
roleUserSchema.index({ UserID: 1, RoleID: 1 }, { unique: true });

// Virtual populate cho người dùng và vai trò
roleUserSchema.virtual('user', {
  ref: 'User',
  localField: 'UserID',
  foreignField: '_id',
  justOne: true
});

roleUserSchema.virtual('role', {
  ref: 'Role',
  localField: 'RoleID',
  foreignField: '_id',
  justOne: true
});

// Cấu hình để virtual fields được trả về trong JSON
roleUserSchema.set('toJSON', { virtuals: true });
roleUserSchema.set('toObject', { virtuals: true });

const RoleUser = mongoose.model('RoleUser', roleUserSchema);

module.exports = RoleUser; 