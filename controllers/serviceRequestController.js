const ServiceRequest = require('../models/ServiceRequest');
const { successResponse, errorResponse, HTTP_STATUS } = require('../utils/responseHandler');

// Lấy danh sách yêu cầu đặt lịch
const getAllServiceRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find().sort({ createdAt: -1 });
    successResponse(res, requests);
  } catch (error) {
    console.error('Error fetching service requests:', error);
    errorResponse(res, 'Lỗi lấy danh sách yêu cầu đặt lịch', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// Lấy thông tin yêu cầu đặt lịch theo ID
const getServiceRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.requestId);
    if (!request) {
      return errorResponse(res, 'Không tìm thấy yêu cầu đặt lịch', HTTP_STATUS.NOT_FOUND);
    }
    successResponse(res, request);
  } catch (error) {
    console.error('Error fetching service request by ID:', error);
    errorResponse(res, 'Lỗi lấy thông tin yêu cầu đặt lịch', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// Cập nhật trạng thái yêu cầu đặt lịch
const updateServiceRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const request = await ServiceRequest.findById(req.params.requestId);
    if (!request) {
      return errorResponse(res, 'Không tìm thấy yêu cầu đặt lịch', HTTP_STATUS.NOT_FOUND);
    }

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        return errorResponse(res, 'Trạng thái không hợp lệ', HTTP_STATUS.BAD_REQUEST);
    }

    request.Status = status;
    await request.save();

    successResponse(res, request, 'Cập nhật trạng thái yêu cầu đặt lịch thành công');
  } catch (error) {
    console.error('Error updating service request status:', error);
    errorResponse(res, 'Lỗi cập nhật trạng thái yêu cầu đặt lịch', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// Xóa yêu cầu đặt lịch
const deleteServiceRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findByIdAndDelete(req.params.requestId);
    if (!request) {
      return errorResponse(res, 'Không tìm thấy yêu cầu đặt lịch', HTTP_STATUS.NOT_FOUND);
    }
    successResponse(res, null, 'Xóa yêu cầu đặt lịch thành công');
  } catch (error) {
    console.error('Error deleting service request:', error);
    errorResponse(res, 'Lỗi xóa yêu cầu đặt lịch', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// API endpoint for customers to create a service request
const createServiceRequest = async (req, res) => {
  try {
    const {
      FullName,
      Phone,
      Email,
      CarModel,
      AppointmentDate,
      AppointmentTime,
      ServiceType,
      Notes
    } = req.body;

    const newRequest = new ServiceRequest({
      FullName,
      Phone,
      Email,
      CarModel,
      AppointmentDate,
      AppointmentTime,
      ServiceType,
      Notes
    });

    await newRequest.save();

    successResponse(res, newRequest, 'Gửi yêu cầu đặt lịch thành công', HTTP_STATUS.CREATED);
  } catch (error) {
    console.error('Error creating service request:', error);
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return errorResponse(res, messages.join(', '), HTTP_STATUS.BAD_REQUEST);
    }
    errorResponse(res, 'Lỗi gửi yêu cầu đặt lịch', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  getAllServiceRequests,
  getServiceRequestById,
  updateServiceRequestStatus,
  deleteServiceRequest,
  createServiceRequest
}; 