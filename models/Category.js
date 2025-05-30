const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  Name: {
    type: String,
    required: [true, 'Tên danh mục là bắt buộc'],
    trim: true
  },
  Description: {
    type: String,
    trim: true
  },
  Image: {
    type: String
  },
  ParentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  Status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  Order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Add index for faster queries
categorySchema.index({ Name: 1 });
categorySchema.index({ ParentID: 1 });

// Virtual populate for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'ParentID'
});

// Configure virtuals to be included in JSON
categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Category', categorySchema); 