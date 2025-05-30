const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  toggleLikeReview,
  addReply,
  updateReviewStatus
} = require('../controllers/reviewsController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// Public routes
router.get('/san-pham/:productId', getProductReviews);

// Protected routes
router.post('/', protect, upload.array('Images', 5), createReview);
router.put('/:id', protect, upload.array('Images', 5), updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/like', protect, toggleLikeReview);
router.post('/:id/replies', protect, addReply);

// Admin routes
router.put('/:id/status', protect, authorize('admin'), updateReviewStatus);

module.exports = router; 