const express = require('express');
const router = express.Router();
const { 
  getAllCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  getCategoryTree 
} = require('../controllers/categoriesController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// Public routes
router.get('/', getAllCategories);
// router.get('/tree', getCategoryTree);
router.get('/:id', getCategoryById);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), upload.single('Image'), createCategory);
router.put('/:id', protect, authorize('admin'), upload.single('Image'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router; 