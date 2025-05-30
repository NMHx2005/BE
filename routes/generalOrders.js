const express = require('express');
const router = express.Router();
const generalOrdersController = require('../controllers/ordersController'); // ordersController will handle general orders

// Import necessary middleware (e.g., authentication, authorization) if they exist
const { protect, authorize } = require('../middleware/authMiddleware');

// Routes for General Order Management
// Use middleware where needed (e.g., protect for all, authorize for admin actions)
router.route('/')
  .get(protect, authorize('admin'), generalOrdersController.getAllOrders) // Admin only
  .post(protect, generalOrdersController.createOrder); // User only

router.route('/:orderId')
  .get(protect, generalOrdersController.getOrderById) // Admin or Order owner
  .delete(protect, authorize('admin'), generalOrdersController.deleteOrder); // Admin only

router.put('/:orderId/status', protect, authorize('admin'), generalOrdersController.updateOrderStatus); // Admin only

router.get('/user/:userId', protect, generalOrdersController.getUserOrders); // Admin or User

module.exports = router; 