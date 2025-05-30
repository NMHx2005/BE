const Service = require('../models/Service');
const { successResponse, errorResponse, HTTP_STATUS } = require('../utils/responseHandler');
// Optional: Import cloudinary to handle deletion of old images on update
// const cloudinary = require('../config/cloudinary');

// @desc    Get all services
// @route   GET /api/dich-vu
// @access  Public
const getAllServices = async (req, res) => {
  try {
    // Add pagination, filtering, and searching later if needed
    const services = await Service.find().sort({ createdAt: -1 });
    successResponse(res, services);
  } catch (error) {
    console.error('Error fetching services:', error);
    errorResponse(res, 'Lỗi khi lấy danh sách dịch vụ', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// @desc    Get single service by ID
// @route   GET /api/dich-vu/:serviceId
// @access  Public
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId);

    if (!service) {
      return errorResponse(res, 'Không tìm thấy dịch vụ', HTTP_STATUS.NOT_FOUND);
    }

    successResponse(res, service);

  } catch (error) {
    console.error('Error fetching service by ID:', error);
    errorResponse(res, 'Lỗi khi lấy chi tiết dịch vụ', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// @desc    Create a new service (Admin)
// @route   POST /api/dich-vu
// @access  Private (Admin)
const createService = async (req, res) => {
  try {
    const { Name, Description, Price, Status } = req.body;
    
    // Get image URL from uploaded file if exists
    const ImageUrl = req.file ? req.file.path : null;

    const service = new Service({
      Name,
      Description,
      Price,
      Status,
      ImageUrl
    });
    
    const createdService = await service.save();
    successResponse(res, createdService, 'Đã tạo dịch vụ thành công', HTTP_STATUS.CREATED);
  } catch (error) {
    console.error('Error creating service:', error);
    // If file was uploaded, consider deleting it on error
    // if (req.file) { /* delete file from cloudinary */ }
    errorResponse(res, 'Lỗi khi tạo dịch vụ', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// @desc    Update a service by ID (Admin)
// @route   PUT /api/dich-vu/:serviceId
// @access  Private (Admin)
const updateService = async (req, res) => {
  try {
    const { Name, Description, Price, Status } = req.body;
    const serviceId = req.params.serviceId;

    // Find the existing service
    const service = await Service.findById(serviceId);

    if (!service) {
      return errorResponse(res, 'Không tìm thấy dịch vụ để cập nhật', HTTP_STATUS.NOT_FOUND);
    }

    // Handle image update
    let newImageUrl = service.ImageUrl; // Keep existing image by default
    if (req.file) {
      // New image uploaded
      // Optional: Delete old image from cloudinary before updating URL
      // if (service.ImageUrl) { /* delete old image */ }
      newImageUrl = req.file.path; // Use the new image URL
    }

    // Update service fields
    service.Name = Name || service.Name;
    service.Description = Description || service.Description;
    service.Price = Price !== undefined ? Price : service.Price;
    service.Status = Status || service.Status;
    service.ImageUrl = newImageUrl; // Set the new or existing image URL

    const updatedService = await service.save(); // Use save() to trigger schema validation/middleware if any

    successResponse(res, updatedService, 'Đã cập nhật dịch vụ thành công');

  } catch (error) {
    console.error('Error updating service:', error);
    // If new file was uploaded on update and error occurs, consider deleting it
    // if (req.file) { /* delete new file from cloudinary */ }
    errorResponse(res, 'Lỗi khi cập nhật dịch vụ', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// @desc    Delete a service by ID (Admin)
// @route   DELETE /api/dich-vu/:serviceId
// @access  Private (Admin)
const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.serviceId);

    if (!service) {
      return errorResponse(res, 'Không tìm thấy dịch vụ để xóa', HTTP_STATUS.NOT_FOUND);
    }

    successResponse(res, null, 'Đã xóa dịch vụ thành công');

  } catch (error) {
    console.error('Error deleting service:', error);
    errorResponse(res, 'Lỗi khi xóa dịch vụ', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
}; 