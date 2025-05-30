const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  UserID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ProductID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  Rating: {
    type: Number,
    required: [true, 'Đánh giá sao là bắt buộc'],
    min: [1, 'Đánh giá tối thiểu là 1 sao'],
    max: [5, 'Đánh giá tối đa là 5 sao']
  },
  Comment: {
    type: String,
    required: [true, 'Nội dung đánh giá là bắt buộc'],
    trim: true
  },
  Images: [{
    type: String
  }],
  Status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  Likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  Replies: [{
    UserID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    Comment: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Add compound index to prevent duplicate reviews
reviewSchema.index({ UserID: 1, ProductID: 1 }, { unique: true });

// Virtual populate for user and product
reviewSchema.virtual('user', {
  ref: 'User',
  localField: 'UserID',
  foreignField: '_id',
  justOne: true
});

reviewSchema.virtual('product', {
  ref: 'Product',
  localField: 'ProductID',
  foreignField: '_id',
  justOne: true
});

// Configure virtuals to be included in JSON
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Review', reviewSchema); 