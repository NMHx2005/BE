const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse, HTTP_STATUS } = require('../utils/responseHandler');

// Middleware to protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from token payload and attach to request (excluding password)
      req.user = await User.findById(decoded.userId).select('-Password');

      next(); // Move to the next middleware/route handler
    } catch (error) {
      console.error('Error in auth middleware (protect):', error);
      errorResponse(res, 'Không được phép truy cập (token lỗi hoặc hết hạn)', HTTP_STATUS.UNAUTHORIZED);
    }
  } else {
    errorResponse(res, 'Không có token, không được phép truy cập', HTTP_STATUS.UNAUTHORIZED);
  }
};

// Middleware to authorize users based on roles
const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user is attached by the protect middleware
    if (!req.user || !roles.includes(req.user.Role)) {
      return errorResponse(res, `Người dùng với vai trò ${req.user ? req.user.Role : 'không xác định'} không được phép truy cập tài nguyên này`, HTTP_STATUS.FORBIDDEN);
    }
    next(); // User has the required role(s), move to the next middleware/route handler
  };
};

module.exports = {
  protect,
  authorize
}; 