const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductsByCategory, getAllProducts } = require('../controllers/productsController');
const { upload } = require('../config/cloudinary');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/:productId', getProductById);
router.post('/', protect, authorize('admin'), upload.fields([
  { name: 'Main_Image', maxCount: 1 },
  { name: 'List_Image', maxCount: 5 }
]), createProduct);
router.put('/:productId', protect, authorize('admin'), upload.fields([
  { name: 'Main_Image', maxCount: 1 },
  { name: 'List_Image', maxCount: 5 }
]), updateProduct);
router.delete('/:productId', protect, authorize('admin'), deleteProduct);

module.exports = router; 