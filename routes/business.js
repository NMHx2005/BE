const express = require('express');
const router = express.Router();
const { bookTestDriveFromCart, updateOrderStatus } = require('../controllers/businessController');

router.post('/nguoi-dung/:userId/gio-hang/dat-lich', bookTestDriveFromCart);
router.put('/lich-lai-thu/:orderId/trang-thai', updateOrderStatus);

module.exports = router; 