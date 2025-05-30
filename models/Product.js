const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  Product_Name: {
    type: String,
    required: [true, 'Tên sản phẩm là bắt buộc'],
    trim: true
  },
  CategoryID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategory',
    required: [true, 'Danh mục sản phẩm là bắt buộc']
  },
  Description: {
    type: String,
    trim: true
  },
  Price: {
    type: Number,
    required: [true, 'Giá sản phẩm là bắt buộc'],
    min: [0, 'Giá sản phẩm không được âm']
  },
  Main_Image: {
    type: String,
    required: [true, 'Hình ảnh chính là bắt buộc'],
    // Bỏ validation Cloudinary URL
    // validate: {
    //   validator: function(v) {
    //     return v.startsWith('https://res.cloudinary.com/');
    //   },
    //   message: 'URL hình ảnh không hợp lệ'
    // }
  },
  List_Image: [{
    type: String,
    // Bỏ validation Cloudinary URL
    // validate: {
    //   validator: function(v) {
    //     return v.startsWith('https://res.cloudinary.com/');
    //   },
    //   message: 'URL hình ảnh không hợp lệ'
    // }
  }],
  Specifications: {
    type: Map,
    of: String
  },
  Status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available'
  },
  Stock: {
    type: Number,
    default: 0,
    min: [0, 'Số lượng tồn kho không được âm']
  }
}, {
  timestamps: true
});

// Tạo index cho tìm kiếm
productSchema.index({ Product_Name: 'text', Description: 'text' });

// Virtual populate cho danh mục
productSchema.virtual('category', {
  ref: 'ProductCategory',
  localField: 'CategoryID',
  foreignField: '_id',
  justOne: true
});

// Middleware trước khi lưu để đảm bảo URL ảnh hợp lệ
// productSchema.pre('save', function(next) {
//   if (this.isModified('Main_Image') && !this.Main_Image.startsWith('https://res.cloudinary.com/')) {
//     next(new Error('URL hình ảnh chính không hợp lệ'));
//   }
  
//   if (this.isModified('List_Image')) {
//     const invalidImages = this.List_Image.filter(img => !img.startsWith('https://res.cloudinary.com/'));
//     if (invalidImages.length > 0) {
//       next(new Error('Có URL hình ảnh phụ không hợp lệ'));
//     }
//   }
  
//   next();
// }); // Bỏ toàn bộ middleware pre('save') này

// Cấu hình để virtual fields được trả về trong JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 