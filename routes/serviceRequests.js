const express = require('express');
const router = express.Router();
const serviceRequestController = require('../controllers/serviceRequestController');

// Route để khách hàng tạo yêu cầu đặt lịch mới
router.post('/', serviceRequestController.createServiceRequest);

// Routes cho admin quản lý yêu cầu đặt lịch
router.get('/', serviceRequestController.getAllServiceRequests);
router.get('/:requestId', serviceRequestController.getServiceRequestById);
router.put('/:requestId/status', serviceRequestController.updateServiceRequestStatus); // Endpoint riêng để cập nhật trạng thái
router.delete('/:requestId', serviceRequestController.deleteServiceRequest);

module.exports = router; 