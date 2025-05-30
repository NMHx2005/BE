const Review = require('../models/Review');
const Product = require('../models/Product');
const { successResponse, errorResponse, HTTP_STATUS } = require('../utils/responseHandler');

// @desc    Get all reviews for a product
// @route   GET /api/danh-gia/san-pham/:productId
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ ProductID: req.params.productId, Status: 'approved' })
        .populate('UserID', 'UserName FullName')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments({ ProductID: req.params.productId, Status: 'approved' })
    ]);

    successResponse(res, {
      reviews,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    errorResponse(res, 'Lỗi khi lấy danh sách đánh giá', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// @desc    Create new review
// @route   POST /api/danh-gia
// @access  Private
const createReview = async (req, res) => {
  try {
    const { ProductID, Rating, Comment } = req.body;
    const UserID = req.user._id;

    // Check if product exists
    const product = await Product.findById(ProductID);
    if (!product) {
      return errorResponse(res, 'Sản phẩm không tồn tại', HTTP_STATUS.NOT_FOUND);
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({ UserID, ProductID });
    if (existingReview) {
      return errorResponse(res, 'Bạn đã đánh giá sản phẩm này', HTTP_STATUS.BAD_REQUEST);
    }

    // Get image URLs from uploaded files
    const Images = req.files ? req.files.map(file => file.path) : [];

    const review = new Review({
      UserID,
      ProductID,
      Rating,
      Comment,
      Images,
      Status: 'pending' // Requires admin approval
    });

    const createdReview = await review.save();
    successResponse(res, createdReview, 'Đã gửi đánh giá thành công', HTTP_STATUS.CREATED);
  } catch (error) {
    console.error('Error creating review:', error);
    errorResponse(res, 'Lỗi khi tạo đánh giá', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// @desc    Update review
// @route   PUT /api/danh-gia/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    const { Rating, Comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return errorResponse(res, 'Không tìm thấy đánh giá', HTTP_STATUS.NOT_FOUND);
    }

    // Check if user owns the review
    if (review.UserID.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Không được phép cập nhật đánh giá này', HTTP_STATUS.FORBIDDEN);
    }

    // Handle image updates
    let Images = review.Images;
    if (req.files && req.files.length > 0) {
      // Optional: Delete old images
      // if (review.Images.length > 0) { /* delete old images */ }
      Images = req.files.map(file => file.path);
    }

    review.Rating = Rating || review.Rating;
    review.Comment = Comment || review.Comment;
    review.Images = Images;
    review.Status = 'pending'; // Reset status for admin approval

    const updatedReview = await review.save();
    successResponse(res, updatedReview, 'Đã cập nhật đánh giá thành công');
  } catch (error) {
    console.error('Error updating review:', error);
    errorResponse(res, 'Lỗi khi cập nhật đánh giá', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// @desc    Delete review
// @route   DELETE /api/danh-gia/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return errorResponse(res, 'Không tìm thấy đánh giá', HTTP_STATUS.NOT_FOUND);
    }

    // Check if user owns the review or is admin
    if (review.UserID.toString() !== req.user._id.toString() && req.user.Role !== 'admin') {
      return errorResponse(res, 'Không được phép xóa đánh giá này', HTTP_STATUS.FORBIDDEN);
    }

    // Optional: Delete images
    // if (review.Images.length > 0) { /* delete images */ }

    await review.remove();
    successResponse(res, null, 'Đã xóa đánh giá thành công');
  } catch (error) {
    console.error('Error deleting review:', error);
    errorResponse(res, 'Lỗi khi xóa đánh giá', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// @desc    Like/Unlike review
// @route   POST /api/danh-gia/:id/like
// @access  Private
const toggleLikeReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return errorResponse(res, 'Không tìm thấy đánh giá', HTTP_STATUS.NOT_FOUND);
    }

    const userId = req.user._id;
    const likeIndex = review.Likes.indexOf(userId);

    if (likeIndex === -1) {
      // Like review
      review.Likes.push(userId);
    } else {
      // Unlike review
      review.Likes.splice(likeIndex, 1);
    }

    await review.save();
    successResponse(res, review, likeIndex === -1 ? 'Đã thích đánh giá' : 'Đã bỏ thích đánh giá');
  } catch (error) {
    console.error('Error toggling review like:', error);
    errorResponse(res, 'Lỗi khi thích/bỏ thích đánh giá', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// @desc    Add reply to review
// @route   POST /api/danh-gia/:id/replies
// @access  Private
const addReply = async (req, res) => {
  try {
    const { Comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return errorResponse(res, 'Không tìm thấy đánh giá', HTTP_STATUS.NOT_FOUND);
    }

    review.Replies.push({
      UserID: req.user._id,
      Comment
    });

    await review.save();
    successResponse(res, review, 'Đã thêm phản hồi thành công');
  } catch (error) {
    console.error('Error adding reply:', error);
    errorResponse(res, 'Lỗi khi thêm phản hồi', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// @desc    Update review status (Admin)
// @route   PUT /api/danh-gia/:id/status
// @access  Private (Admin)
const updateReviewStatus = async (req, res) => {
  try {
    const { Status } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return errorResponse(res, 'Không tìm thấy đánh giá', HTTP_STATUS.NOT_FOUND);
    }

    review.Status = Status;
    await review.save();

    successResponse(res, review, 'Đã cập nhật trạng thái đánh giá thành công');
  } catch (error) {
    console.error('Error updating review status:', error);
    errorResponse(res, 'Lỗi khi cập nhật trạng thái đánh giá', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  toggleLikeReview,
  addReply,
  updateReviewStatus
}; 