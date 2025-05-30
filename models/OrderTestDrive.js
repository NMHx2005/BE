const mongoose = require('mongoose');

const orderTestDriveSchema = new mongoose.Schema({
  UserID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID người dùng là bắt buộc']
  },
  CartID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
    required: [true, 'ID giỏ hàng là bắt buộc']
  },
  Order_Date: {
    type: Date,
    required: [true, 'Ngày đặt lịch là bắt buộc']
  },
  Test_Drive_Date: {
    type: Date,
    required: [true, 'Ngày lái thử là bắt buộc']
  },
  Address: {
    type: String,
    required: [true, 'Địa chỉ là bắt buộc']
  },
  Status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  Notes: {
    type: String
  },
  Total_Amount: {
    type: Number,
    required: [true, 'Tổng tiền là bắt buộc'],
    min: [0, 'Tổng tiền không được âm']
  },
  ImageUrl: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Virtual populate cho người dùng và giỏ hàng
orderTestDriveSchema.virtual('user', {
  ref: 'User',
  localField: 'UserID',
  foreignField: '_id',
  justOne: true
});

orderTestDriveSchema.virtual('cart', {
  ref: 'Cart',
  localField: 'CartID',
  foreignField: '_id',
  justOne: true
});

// Cấu hình để virtual fields được trả về trong JSON
orderTestDriveSchema.set('toJSON', { virtuals: true });
orderTestDriveSchema.set('toObject', { virtuals: true });

const OrderTestDrive = mongoose.model('OrderTestDrive', orderTestDriveSchema);

module.exports = OrderTestDrive; 