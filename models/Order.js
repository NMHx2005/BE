const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  UserID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Option 1: Reference the Cart (might be simpler if Cart structure is complex)
  // CartID: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Cart',
  //   required: true // Or false, depending on how order creation works
  // },
  // Option 2: Embed relevant cart/item data (often better for historical order data)
  items: [{
    ProductID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    priceAtOrder: { // Store price at the time of order
      type: Number,
      required: true
    }
  }],
  Order_Date: {
    type: Date,
    default: Date.now
  },
  Total_Amount: {
    type: Number,
    required: true,
    min: 0
  },
  Status: {
    type: String,
    enum: ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  ShippingAddress: {
    FullName: { type: String, required: true },
    Address: { type: String, required: true },
    Phone: { type: String, required: true },
    Email: { type: String } // Optional
  },
  PaymentMethod: {
    type: String,
    // enum: ['cashOnDelivery', 'stripe', ...], // Define actual payment methods
    required: true
  },
  Notes: {
    type: String
  },
  // Add any other relevant fields (e.g., tracking number, payment details)
}, { timestamps: true }); // Add timestamps for createdAt and updatedAt

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 