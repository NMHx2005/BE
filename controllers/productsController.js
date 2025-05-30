const Product = require('../models/Product');
const { successResponse, errorResponse, HTTP_STATUS } = require('../utils/responseHandler');
// const { cloudinary } = require('../config/cloudinary'); // Xóa import Cloudinary

// Hàm helper để xóa ảnh từ Cloudinary (sẽ xóa sau khi không còn sử dụng)
// const deleteImageFromCloudinary = async (imageUrl) => {
//   if (!imageUrl) return;
//   try {
//     const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
//     await cloudinary.uploader.destroy(publicId);
//   } catch (error) {
//     console.error('Error deleting image from Cloudinary:', error);
//   }
// };

// Lấy danh sách sản phẩm
const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('CategoryID', 'Category_Name')
      .sort({ createdAt: -1 });
    successResponse(res, products);
  } catch (error) {
    errorResponse(res, 'Lỗi lấy danh sách sản phẩm', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Lấy thông tin sản phẩm theo ID
const getProductById = async (req, res) => {
  try {
    const productId = req.params.productId;
    console.log(`Attempting to find product with ID: ${productId}`); // Log ID nhận được

    const product = await Product.findById(productId)
      .populate('CategoryID', 'Category_Name');

    console.log(`Product find result for ID ${productId}: ${product ? 'Found' : 'Not Found'}`); // Log kết quả tìm kiếm
    console.log('Found product object:', product); // Log toàn bộ object nếu tìm thấy (cẩn thận với dữ liệu nhạy cảm)
    
    if (!product) {
      console.warn(`Product with ID ${productId} not found in DB.`); // Log cảnh báo nếu không tìm thấy
      return errorResponse(res, 'Không tìm thấy sản phẩm', HTTP_STATUS.NOT_FOUND);
    }
    successResponse(res, product);
  } catch (error) {
    console.error(`Error fetching product with ID ${req.params.productId}:`, error); // Log lỗi chi tiết
    errorResponse(res, 'Lỗi lấy thông tin sản phẩm', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Tạo sản phẩm mới
const createProduct = async (req, res) => {
  try {
    const {
      Product_Name,
      CategoryID,
      Description,
      Price,
      Specifications,
      Stock,
      Main_Image, // Lấy URL ảnh chính từ body
      List_Image // Lấy danh sách URLs ảnh phụ từ body
    } = req.body;

    // Kiểm tra xem có URL ảnh chính được gửi lên không
    if (!Main_Image) {
      return errorResponse(res, 'URL hình ảnh chính là bắt buộc', HTTP_STATUS.BAD_REQUEST);
    }

    // Không cần upload ảnh lên Cloudinary nữa, chỉ cần lưu URL
    // Bỏ qua phần xử lý req.files và Cloudinary upload

    const product = new Product({
      Product_Name,
      CategoryID,
      Description,
      Price,
      Main_Image: Main_Image, // Lưu URL ảnh chính
      List_Image: List_Image, // Lưu danh sách URLs ảnh phụ
      Specifications,
      Stock
    });

    await product.save();
    successResponse(res, product, 'Tạo sản phẩm thành công', HTTP_STATUS.CREATED);
  } catch (error) {
    // Ghi log lỗi chi tiết hơn để debug
    console.error('Error creating product:', error);
    errorResponse(res, 'Lỗi tạo sản phẩm', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Cập nhật sản phẩm
const updateProduct = async (req, res) => {
  try {
    // Lấy tất cả các trường từ body, không kiểm tra sự tồn tại
    const {
      Product_Name,
      CategoryID,
      Description,
      Price,
      Specifications,
      Stock,
      Main_Image, // Lấy URL ảnh chính từ body
      List_Image, // Lấy danh sách URLs ảnh phụ từ body
      Status // Thêm trường Status
    } = req.body;

    const product = await Product.findById(req.params.productId);
    if (!product) {
      return errorResponse(res, 'Không tìm thấy sản phẩm', HTTP_STATUS.NOT_FOUND);
    }

    // Cập nhật tất cả các thông tin từ body
    // Không cần kiểm tra req.files hay upload/xóa ảnh Cloudinary nữa
    product.Product_Name = Product_Name;
    product.CategoryID = CategoryID;
    product.Description = Description;
    product.Price = Price;
    product.Specifications = Specifications; // Lưu trực tiếp object/json
    product.Stock = Stock;
    product.Main_Image = Main_Image; // Lưu URL ảnh chính
    product.List_Image = List_Image; // Lưu danh sách URLs ảnh phụ
    product.Status = Status; // Cập nhật trường Status

    await product.save();
    successResponse(res, product, 'Cập nhật sản phẩm thành công');
  } catch (error) {
    // Ghi log lỗi chi tiết hơn để debug
    console.error('Error updating product:', error);
    errorResponse(res, 'Lỗi cập nhật sản phẩm', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);
    if (!product) {
      return errorResponse(res, 'Không tìm thấy sản phẩm', HTTP_STATUS.NOT_FOUND);
    }

    // Không cần xóa hình ảnh từ Cloudinary nữa
    // Bỏ qua phần xóa ảnh

    successResponse(res, null, 'Xóa sản phẩm thành công');
  } catch (error) {
    // Ghi log lỗi chi tiết hơn để debug
    console.error('Error deleting product:', error);
    errorResponse(res, 'Lỗi xóa sản phẩm', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Lấy sản phẩm theo danh mục
const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ CategoryID: req.params.categoryId })
      .populate('CategoryID', 'Category_Name')
      .sort({ createdAt: -1 });
    successResponse(res, products);
  } catch (error) {
    errorResponse(res, 'Lỗi lấy sản phẩm theo danh mục', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Get all products with pagination, search and filters
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      categoryId,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    // Search by product name
    if (search) {
      query.Product_Name = { $regex: search, $options: 'i' };
    }
    
    // Filter by category
    if (categoryId) {
      query.CategoryID = categoryId;
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.Price = {};
      if (minPrice) query.Price.$gte = Number(minPrice);
      if (maxPrice) query.Price.$lte = Number(maxPrice);
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('CategoryID'),
      Product.countDocuments(query)
    ]);

    res.json({
      products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getAllProducts
}; 