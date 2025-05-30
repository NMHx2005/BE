const ProductCategory = require('../models/ProductCategory');
const { successResponse, errorResponse, HTTP_STATUS } = require('../utils/responseHandler');
const Category = require('../models/ProductCategory');
const Product = require('../models/Product');

// Lấy danh sách danh mục
const getCategories = async (req, res) => {
  try {
    const categories = await ProductCategory.find();
    successResponse(res, categories);
  } catch (error) {
    errorResponse(res, 'Lỗi lấy danh sách danh mục', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Lấy thông tin danh mục theo ID
const getCategoryById = async (req, res) => {
  try {
    const category = await ProductCategory.findById(req.params.categoryId);
    if (!category) {
      return errorResponse(res, 'Không tìm thấy danh mục', HTTP_STATUS.NOT_FOUND);
    }
    successResponse(res, category);
  } catch (error) {
    errorResponse(res, 'Lỗi lấy thông tin danh mục', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Tạo danh mục mới
const createCategory = async (req, res) => {
  try {
    const { Category_Name, Description } = req.body;

    // Kiểm tra danh mục đã tồn tại
    const existingCategory = await ProductCategory.findOne({ Category_Name });
    if (existingCategory) {
      return errorResponse(res, 'Tên danh mục đã tồn tại', HTTP_STATUS.BAD_REQUEST);
    }

    const category = new ProductCategory({
      Category_Name,
      Description
    });

    await category.save();
    successResponse(res, category, 'Tạo danh mục thành công', HTTP_STATUS.CREATED);
  } catch (error) {
    errorResponse(res, 'Lỗi tạo danh mục', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Cập nhật danh mục
const updateCategory = async (req, res) => {
  try {
    const { Category_Name, Description } = req.body;
    const category = await ProductCategory.findById(req.params.categoryId);

    if (!category) {
      return errorResponse(res, 'Không tìm thấy danh mục', HTTP_STATUS.NOT_FOUND);
    }

    // Kiểm tra tên danh mục mới có bị trùng không
    if (Category_Name && Category_Name !== category.Category_Name) {
      const existingCategory = await ProductCategory.findOne({ Category_Name });
      if (existingCategory) {
        return errorResponse(res, 'Tên danh mục đã tồn tại', HTTP_STATUS.BAD_REQUEST);
      }
    }

    // Cập nhật thông tin
    if (Category_Name) category.Category_Name = Category_Name;
    if (Description) category.Description = Description;

    await category.save();
    successResponse(res, category, 'Cập nhật danh mục thành công');
  } catch (error) {
    errorResponse(res, 'Lỗi cập nhật danh mục', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Xóa danh mục
const deleteCategory = async (req, res) => {
  try {
    const category = await ProductCategory.findByIdAndDelete(req.params.categoryId);
    if (!category) {
      return errorResponse(res, 'Không tìm thấy danh mục', HTTP_STATUS.NOT_FOUND);
    }
    successResponse(res, null, 'Xóa danh mục thành công');
  } catch (error) {
    errorResponse(res, 'Lỗi xóa danh mục', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Get all categories with pagination and search
const getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = {};

    // Search by category name
    if (search) {
      query.Category_Name = { $regex: search, $options: 'i' };
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Execute query
    const [categories, total] = await Promise.all([
      Category.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Category.countDocuments(query)
    ]);

    res.json({
      categories,
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

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ CategoryID: req.params.categoryId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments({ CategoryID: req.params.categoryId })
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
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getProductsByCategory
}; 