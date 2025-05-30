const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { successResponse, errorResponse, HTTP_STATUS } = require('../utils/responseHandler');

// This controller is intended for general order management.
// All functions related to OrderTestDrive have been removed.

// Functions for general order management will be added here later.

// @desc    Create a new order from cart (using items directly from frontend payload)
// @route   POST /api/don-hang
// @access  Private (User)
const createOrder = async (req, res) => {
  try {
    // Receive order details and items directly from the frontend payload
    const { UserID, items, Total_Amount, Status, Order_Date, ShippingAddress } = req.body; // Extract ShippingAddress object

    // Extract PaymentMethod and Notes from within the received ShippingAddress object
    const paymentMethod = ShippingAddress?.PaymentMethod || 'cashOnDelivery';
    const notes = ShippingAddress?.Notes;

    console.log('Received data for order creation:', { UserID, items, ShippingAddress, paymentMethod, notes });

    // Basic validation - check required fields based on Order schema
    if (!UserID || !items || !Array.isArray(items) || items.length === 0 || !ShippingAddress || !ShippingAddress.FullName || !ShippingAddress.Address || !ShippingAddress.Phone || !paymentMethod) {
      return errorResponse(res, 'Dữ liệu đặt hàng không hợp lệ: Thiếu thông tin cơ bản hoặc phương thức thanh toán', HTTP_STATUS.BAD_REQUEST);
    }

    // --- Backend validation and recalculation (Important for security) ---
    // 1. Validate ProductIDs and quantities
    // 2. Fetch current prices from database to calculate accurate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.ProductID || !item.quantity || item.quantity <= 0) {
        return errorResponse(res, 'Dữ liệu sản phẩm trong giỏ hàng không hợp lệ', HTTP_STATUS.BAD_REQUEST);
      }
      const product = await Product.findById(item.ProductID);
      if (!product) {
        // If a product in the cart is not found, perhaps return error or skip item
        console.warn(`Product with ID ${item.ProductID} not found during order creation.`);
        continue; // Skip this item if product not found
        // Or return errorResponse(res, `Sản phẩm ${item.ProductID} không tồn tại`, HTTP_STATUS.BAD_REQUEST); 
      }

      // Use current price from database, not priceAtOrder from frontend payload for security
      const priceToUse = product.Price;

      orderItems.push({
        ProductID: item.ProductID,
        quantity: item.quantity,
        priceAtOrder: priceToUse, // Use the price fetched from DB
      });
      totalAmount += priceToUse * item.quantity;
    }

    // Check if there are any valid items after validation
    if (orderItems.length === 0) {
       return errorResponse(res, 'Giỏ hàng trống hoặc chứa sản phẩm không hợp lệ', HTTP_STATUS.BAD_REQUEST);
    }
    // --- End backend validation and recalculation ---

    // Create the new order
    const order = new Order({
      UserID: UserID,
      items: orderItems, // Use validated and recalculated items
      Total_Amount: totalAmount, // Use calculated total amount (from backend calculation)
      ShippingAddress: { // Structure matches Order schema's embedded ShippingAddress
        FullName: ShippingAddress.FullName,
        Address: ShippingAddress.Address,
        Phone: ShippingAddress.Phone,
        Email: ShippingAddress.Email, // Optional field
        // Remove PaymentMethod and Notes from the embedded object as they are top-level in Order schema
      },
      PaymentMethod: paymentMethod, // Assign extracted paymentMethod to top level
      Notes: notes, // Assign extracted notes to top level
      Status: Status || 'pending', // Use provided Status, default if not available
      Order_Date: Order_Date ? new Date(Order_Date) : new Date() // Use provided date or default to now
    });

    console.log('Order data to be saved:', order);

    const createdOrder = await order.save();

    // --- Cart Management After Order ---
    // Now, find the active cart and mark it as completed or delete it.
    // This step is separate and doesn't affect order creation from payload items.
    const activeCart = await Cart.findOne({ UserID: UserID, Status: 'active' });
    if (activeCart) {
      activeCart.Status = 'completed'; // Or 'inactive'
      // Optionally reset items array if a new cart should be created next time for the user
      // activeCart.items = []; 
      // activeCart.Total_Amount = 0;
      await activeCart.save();
      console.log(`Marked cart ${activeCart._id} as completed for user ${UserID}`);
    } else {
       console.warn(`No active cart found for user ${UserID} after successful order creation. This might indicate an inconsistency.`);
    }
    // Optionally, clear the user's active cart by deleting it if needed
    // await Cart.findOneAndDelete({ UserID: UserID, Status: 'active' });
    // --- End Cart Management ---

    successResponse(res, createdOrder, 'Đã tạo đơn hàng thành công', HTTP_STATUS.CREATED);

  } catch (error) {
    console.error('Error creating order:', error);
    errorResponse(res, 'Lỗi khi tạo đơn hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// @desc    Get all general orders (Admin)
// @route   GET /api/don-hang
// @access  Private (Admin)
const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Search by order ID, user info, or shipping address details
    if (search) {
      query.$or = [
        { _id: search }, // Search by exact order ID string
        { 'UserID.UserName': { $regex: search, $options: 'i' } },
        { 'UserID.Email': { $regex: search, $options: 'i' } },
        { 'UserID.Phone': { $regex: search, $options: 'i' } },
        { 'ShippingAddress.FullName': { $regex: search, $options: 'i' } },
        { 'ShippingAddress.Address': { $regex: search, $options: 'i' } },
        { 'ShippingAddress.Phone': { $regex: search, $options: 'i' } }
      ].filter(condition => {
         // Filter out conditions that might cause errors if populated fields are not present
         // Note: The populated fields (UserID) search will only work if populate is done before this query part.
         // A better approach for searching populated fields might be aggregation.
         // For simplicity now, we rely on populate and hope the $or handles cases where fields are missing.
         return true; // Keep all conditions for now
      });
    }

    // Filter by status
    if (status) {
      query.Status = status;
    }

    // Filter by date range (Order_Date)
    if (startDate || endDate) {
      query.Order_Date = {};
      if (startDate) query.Order_Date.$gte = new Date(startDate);
      if (endDate) query.Order_Date.$lte = new Date(endDate);
    }

    // Calculate skip
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query and count documents concurrently
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('UserID', 'UserName Email Phone')
        .populate('items.ProductID', 'Product_Name Price')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query)
    ]);

    successResponse(res, {
      orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching general orders with pagination/search:', error);
    errorResponse(res, 'Lỗi khi lấy danh sách đơn hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// @desc    Get single general order by ID
// @route   GET /api/don-hang/:orderId
// @access  Private (Admin, User)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('UserID', 'UserName Email Phone').populate('items.ProductID', 'Product_Name Price');

    if (!order) {
      return errorResponse(res, 'Không tìm thấy đơn hàng', HTTP_STATUS.NOT_FOUND);
    }

    // Add logic to ensure user can only see their own orders unless admin
    // if (req.user.role !== 'admin' && order.UserID.toString() !== req.user._id.toString()) {
    //   return errorResponse(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);
    // }

    successResponse(res, order);

  } catch (error) {
    console.error('Error fetching general order by ID:', error);
    errorResponse(res, 'Lỗi khi lấy chi tiết đơn hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// @desc    Get orders for a specific user
// @route   GET /api/don-hang/user/:userId
// @access  Private (User, Admin)
const getUserOrders = async (req, res) => {
  try {
    // Add pagination, filtering, and searching later
    const orders = await Order.find({ UserID: req.params.userId }).populate('UserID', 'UserName Email Phone').populate('items.ProductID', 'Product_Name Price').sort({ createdAt: -1 });

    // Add logic to ensure user can only see their own orders unless admin
    // if (req.user.role !== 'admin' && req.params.userId !== req.user._id.toString()) {
    //    return errorResponse(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);
    // }

    successResponse(res, orders);

  } catch (error) {
    console.error('Error fetching user orders:', error);
    errorResponse(res, 'Lỗi khi lấy đơn hàng của người dùng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/don-hang/:orderId/status
// @access  Private (Admin)
const updateOrderStatus = async (req, res) => {
   try {
     const { status } = req.body;

     const order = await Order.findById(req.params.orderId);

     if (!order) {
       return errorResponse(res, 'Không tìm thấy đơn hàng', HTTP_STATUS.NOT_FOUND);
     }

     // Validate status if needed

     order.Status = status;
     await order.save();

     successResponse(res, order, 'Cập nhật trạng thái đơn hàng thành công');

   } catch (error) {
     console.error('Error updating order status:', error);
     errorResponse(res, 'Lỗi khi cập nhật trạng thái đơn hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
   }
};

// @desc    Delete a general order (Admin)
// @route   DELETE /api/don-hang/:orderId
// @access  Private (Admin)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.orderId);

    if (!order) {
      return errorResponse(res, 'Không tìm thấy đơn hàng', HTTP_STATUS.NOT_FOUND);
    }

    successResponse(res, null, 'Đã xóa đơn hàng thành công');

  } catch (error) {
    console.error('Error deleting order:', error);
    errorResponse(res, 'Lỗi khi xóa đơn hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  deleteOrder
}; 