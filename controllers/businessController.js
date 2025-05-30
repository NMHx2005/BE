const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const OrderTestDrive = require('../models/OrderTestDrive');
const { successResponse, errorResponse, HTTP_STATUS } = require('../utils/responseHandler');

// Đặt lịch lái thử từ giỏ hàng
const bookTestDriveFromCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { Test_Drive_Date, Address, Notes } = req.body;
    // Lấy giỏ hàng active của user
    const cart = await Cart.findOne({ UserID: userId, Status: 'active' });
    if (!cart) {
      return errorResponse(res, 'Không tìm thấy giỏ hàng', HTTP_STATUS.NOT_FOUND);
    }
    const cartItems = await CartItem.find({ CartID: cart._id });
    if (cartItems.length === 0) {
      return errorResponse(res, 'Giỏ hàng trống', HTTP_STATUS.BAD_REQUEST);
    }
    // Tạo lịch lái thử
    const order = new OrderTestDrive({
      UserID: userId,
      CartID: cart._id,
      Order_Date: new Date(),
      Test_Drive_Date,
      Address,
      Notes,
      Total_Amount: cart.Total_Amount
    });
    await order.save();
    // Cập nhật trạng thái giỏ hàng
    cart.Status = 'completed';
    await cart.save();
    successResponse(res, order, 'Đặt lịch lái thử thành công', HTTP_STATUS.CREATED);
  } catch (error) {
    errorResponse(res, 'Lỗi đặt lịch lái thử', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Cập nhật trạng thái lịch lái thử
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { Status } = req.body;
    const order = await OrderTestDrive.findById(orderId);
    if (!order) {
      return errorResponse(res, 'Không tìm thấy lịch lái thử', HTTP_STATUS.NOT_FOUND);
    }
    order.Status = Status;
    await order.save();
    successResponse(res, order, 'Cập nhật trạng thái thành công');
  } catch (error) {
    errorResponse(res, 'Lỗi cập nhật trạng thái', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

module.exports = {
  bookTestDriveFromCart,
  updateOrderStatus
}; 