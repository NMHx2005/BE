const express = require('express');
const router = express.Router();
const newsEventsController = require('../controllers/newsEventsController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary'); // Import upload middleware

// Routes for News & Events Management
// Use middleware where needed (e.g., authorize for admin actions)
router.route('/')
  .get(newsEventsController.getAllNewsEvents) // Public
  .post(protect, authorize('admin'), upload.single('ImageUrl'), newsEventsController.createNewsEvent); // Admin only, add upload middleware

router.route('/:newsEventId')
  .get(newsEventsController.getNewsEventById) // Public
  .put(protect, authorize('admin'), upload.single('ImageUrl'), newsEventsController.updateNewsEvent) // Admin only, add upload middleware
  .delete(protect, authorize('admin'), newsEventsController.deleteNewsEvent); // Admin only

module.exports = router; 