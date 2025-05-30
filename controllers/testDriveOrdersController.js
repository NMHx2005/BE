const TestDriveOrder = require('../models/OrderTestDrive');

// Get all orders with pagination, search and filters
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

    // Search by order ID or user info
    if (search) {
      query.$or = [
        { _id: { $regex: search, $options: 'i' } },
        { 'UserID.UserName': { $regex: search, $options: 'i' } },
        { 'UserID.Email': { $regex: search, $options: 'i' } },
        { 'UserID.Phone': { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status) {
      query.Status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.Order_Date = {};
      if (startDate) query.Order_Date.$gte = new Date(startDate);
      if (endDate) query.Order_Date.$lte = new Date(endDate);
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Execute query
    const [orders, total] = await Promise.all([
      TestDriveOrder.find(query)
        .populate('UserID', 'UserName Email Phone')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(Number(limit)),
      TestDriveOrder.countDocuments(query)
    ]);

    res.json({
      orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await TestDriveOrder.findById(req.params.orderId)
      .populate('UserID', 'UserName Email Phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Allow admin or the order owner to get the order data
    if (req.user.role !== 'admin' && order.UserID.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Không được phép truy cập lịch lái thử này' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new order
const createOrder = async (req, res) => {
  try {
    const order = new TestDriveOrder(req.body);
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update order
const updateOrder = async (req, res) => {
  try {
    const order = await TestDriveOrder.findByIdAndUpdate(
      req.params.orderId,
      req.body,
      { new: true }
    ).populate('UserID', 'UserName Email Phone');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const order = await TestDriveOrder.findByIdAndDelete(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    // Allow admin to fetch orders for any user, users can only fetch their own
    if (req.user.role !== 'admin' && req.params.userId !== req.user._id.toString()) {
       return res.status(403).json({ message: 'Không được phép truy cập lịch lái thử của người dùng khác' });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      TestDriveOrder.find({ UserID: req.params.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      TestDriveOrder.countDocuments({ UserID: req.params.userId })
    ]);

    res.json({
      orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getUserOrders
}; 