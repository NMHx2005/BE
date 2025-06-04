const mongoose = require('mongoose');

// Define the schema for items embedded within the Cart
const embeddedCartItemSchema = new mongoose.Schema({
  ProductID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Still reference Product for product details
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Số lượng phải lớn hơn 0']
  },
  priceAtOrder: { // Store price at the time item was added to cart
    type: Number,
    required: [true, 'Đơn giá là bắt buộc'],
    min: [0, 'Đơn giá không được âm']
  },
  Image: {
    type: String // Store image URL directly
  }
});

const cartSchema = new mongoose.Schema({
  UserID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [embeddedCartItemSchema], // Array of embedded cart item objects
  Total_Amount: {
    type: Number,
    default: 0
  },
  Status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Cấu hình để virtual fields được trả về trong JSON (if any are added later)
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart; 