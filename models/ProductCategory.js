const mongoose = require('mongoose');

const productCategorySchema = new mongoose.Schema({
  Category_Name: {
    type: String,
    required: [true, 'Tên danh mục là bắt buộc'],
    trim: true,
    unique: true
  },
  Description: {
    type: String,
    trim: true
  },
  Status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Tạo index cho tìm kiếm
productCategorySchema.index({ Category_Name: 'text' });

const ProductCategory = mongoose.model('ProductCategory', productCategorySchema, 'productcategories');

module.exports = ProductCategory; 