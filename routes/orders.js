const express = require('express');
const router = express.Router();
const { getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder, getUserOrders } = require('../controllers/testDriveOrdersController');
const { upload } = require('../config/cloudinary');
const { protect, authorize } = require('../middleware/authMiddleware');

// Routes for Test Drive Orders

router.route('/')
  .get(protect, authorize('admin'), getAllOrders) // Get all test drive orders (Admin only)
  .post(protect, upload.single('image'), createOrder); // Create test drive order (User only)

router.route('/:orderId')
  .get(protect, getOrderById) // Get test drive order by ID (Admin or owner)
  .put(protect, authorize('admin'), updateOrder) // Update test drive order by ID (Admin only)
  .delete(protect, authorize('admin'), deleteOrder); // Delete test drive order by ID (Admin only)

router.get('/user/:userId', protect, getUserOrders); // Get test drive orders for a user (Admin or user)

// Note: The getOrderById and getUserOrders controllers need to implement logic
// to allow users to access only their own test drive orders unless they are admin.

module.exports = router; 