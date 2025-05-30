const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/servicesController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary'); // Import upload middleware

// Routes for Service Management
// Use middleware where needed (e.g., authorize for admin actions)
router.route('/')
  .get(servicesController.getAllServices) // Public
  .post(protect, authorize('admin'), upload.single('ImageUrl'), servicesController.createService); // Admin only, add upload middleware

router.route('/:serviceId')
  .get(servicesController.getServiceById) // Public
  .put(protect, authorize('admin'), upload.single('ImageUrl'), servicesController.updateService) // Admin only, add upload middleware
  .delete(protect, authorize('admin'), servicesController.deleteService); // Admin only

module.exports = router; 