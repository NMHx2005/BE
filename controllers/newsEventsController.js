const NewsEvent = require('../models/NewsEvent');
const { successResponse, errorResponse, HTTP_STATUS } = require('../utils/responseHandler');
// Optional: Import cloudinary to handle deletion of old images on update
// const cloudinary = require('../config/cloudinary');

// @desc    Get all news and events
// @route   GET /api/tin-tuc-su-kien
// @access  Public
const getAllNewsEvents = async (req, res) => {
  try {
    // Add pagination, filtering, and searching later if needed
    // Filter by status for public access (only published)
    const query = {};
    // if (req.user && req.user.role !== 'admin') { // Example: only show published to non-admins
    //   query.Status = 'published';
    // }

    const newsEvents = await NewsEvent.find(query).sort({ PublishDate: -1, createdAt: -1 });
    successResponse(res, newsEvents);
  } catch (error) {
    console.error('Error fetching news and events:', error);
    errorResponse(res, 'Lỗi khi lấy danh sách tin tức/sự kiện', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// @desc    Get single news or event by ID
// @route   GET /api/tin-tuc-su-kien/:newsEventId
// @access  Public
const getNewsEventById = async (req, res) => {
  try {
    const newsEvent = await NewsEvent.findById(req.params.newsEventId);

    if (!newsEvent) {
      return errorResponse(res, 'Không tìm thấy tin tức/sự kiện', HTTP_STATUS.NOT_FOUND);
    }

     // Add logic to prevent non-admins from viewing non-published drafts if needed
    // if (newsEvent.Status !== 'published' && (!req.user || req.user.role !== 'admin')) {
    //    return errorResponse(res, 'Không tìm thấy tin tức/sự kiện', HTTP_STATUS.NOT_FOUND);
    // }

    successResponse(res, newsEvent);

  } catch (error) {
    console.error('Error fetching news or event by ID:', error);
    errorResponse(res, 'Lỗi khi lấy chi tiết tin tức/sự kiện', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// @desc    Create a new news or event (Admin)
// @route   POST /api/tin-tuc-su-kien
// @access  Private (Admin)
const createNewsEvent = async (req, res) => {
  try {
    const { Title, Content, PublishDate, Status } = req.body;
    
    // Get image URL from uploaded file if exists
    const ImageUrl = req.file ? req.file.path : null;

    const newsEvent = new NewsEvent({
      Title,
      Content,
      PublishDate,
      Status,
      ImageUrl
    });
    
    const createdNewsEvent = await newsEvent.save();
    successResponse(res, createdNewsEvent, 'Đã tạo tin tức/sự kiện thành công', HTTP_STATUS.CREATED);
  } catch (error) {
    console.error('Error creating news or event:', error);
    // If file was uploaded, consider deleting it on error
    // if (req.file) { /* delete file from cloudinary */ }
    errorResponse(res, 'Lỗi khi tạo tin tức/sự kiện', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// @desc    Update a news or event by ID (Admin)
// @route   PUT /api/tin-tuc-su-kien/:newsEventId
// @access  Private (Admin)
const updateNewsEvent = async (req, res) => {
  try {
    const { Title, Content, PublishDate, Status } = req.body;
    const newsEventId = req.params.newsEventId;

    // Find the existing news or event
    const newsEvent = await NewsEvent.findById(newsEventId);

    if (!newsEvent) {
      return errorResponse(res, 'Không tìm thấy tin tức/sự kiện để cập nhật', HTTP_STATUS.NOT_FOUND);
    }

    // Handle image update
    let newImageUrl = newsEvent.ImageUrl; // Keep existing image by default
    if (req.file) {
      // New image uploaded
      // Optional: Delete old image from cloudinary before updating URL
      // if (newsEvent.ImageUrl) { /* delete old image */ }
      newImageUrl = req.file.path; // Use the new image URL
    }

    // Update news event fields
    newsEvent.Title = Title || newsEvent.Title;
    newsEvent.Content = Content || newsEvent.Content;
    newsEvent.PublishDate = PublishDate || newsEvent.PublishDate;
    newsEvent.Status = Status || newsEvent.Status;
    newsEvent.ImageUrl = newImageUrl; // Set the new or existing image URL

    const updatedNewsEvent = await newsEvent.save(); // Use save() to trigger schema validation/middleware if any

    successResponse(res, updatedNewsEvent, 'Đã cập nhật tin tức/sự kiện thành công');

  } catch (error) {
    console.error('Error updating news or event:', error);
    // If new file was uploaded on update and error occurs, consider deleting it
    // if (req.file) { /* delete new file from cloudinary */ }
    errorResponse(res, 'Lỗi khi cập nhật tin tức/sự kiện', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// @desc    Delete a news or event by ID (Admin)
// @route   DELETE /api/tin-tuc-su-kien/:newsEventId
// @access  Private (Admin)
const deleteNewsEvent = async (req, res) => {
  try {
    const newsEvent = await NewsEvent.findByIdAndDelete(req.params.newsEventId);

    if (!newsEvent) {
      return errorResponse(res, 'Không tìm thấy tin tức/sự kiện để xóa', HTTP_STATUS.NOT_FOUND);
    }

    successResponse(res, null, 'Đã xóa tin tức/sự kiện thành công');

  } catch (error) {
    console.error('Error deleting news or event:', error);
    errorResponse(res, 'Lỗi khi xóa tin tức/sự kiện', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  getAllNewsEvents,
  getNewsEventById,
  createNewsEvent,
  updateNewsEvent,
  deleteNewsEvent
}; 