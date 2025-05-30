const CartItem = require('../models/CartItem');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { successResponse, errorResponse, HTTP_STATUS } = require('../utils/responseHandler');
const { cloudinary } = require('../config/cloudinary');
const mongoose = require('mongoose');

// Lấy danh sách mục trong giỏ hàng
const getCartItems = async (req, res) => {
  try {
    const cartItems = await CartItem.find({ CartID: req.params.cartId })
      .populate('ProductID', 'Product_Name Price Main_Image');
    successResponse(res, cartItems);
  } catch (error) {
    errorResponse(res, 'Lỗi lấy danh sách mục trong giỏ hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Thêm mục vào giỏ hàng
const addCartItem = async (req, res) => {
  try {
    const { ProductID, quantity } = req.body;
    const cartIdString = req.params.cartId; // Lấy cartId dạng chuỗi

    // Chuyển đổi sang ObjectId
    let cartId;
    try {
      cartId = new mongoose.Types.ObjectId(cartIdString);
    } catch (error) {
      return errorResponse(res, 'ID giỏ hàng không hợp lệ', HTTP_STATUS.BAD_REQUEST);
    }

    let productObjectId;
    try {
      productObjectId = new mongoose.Types.ObjectId(ProductID);
    } catch (error) {
      return errorResponse(res, 'ID sản phẩm không hợp lệ', HTTP_STATUS.BAD_REQUEST);
    }

    // Tìm hoặc tạo giỏ hàng
    let cart = await Cart.findById(cartId);
    if (!cart) {
      // Nếu giỏ hàng không tồn tại, tạo mới
      cart = new Cart({
        _id: cartId, // Sử dụng ObjectId
        UserID: cartId, // Lưu ObjectId vào UserID field
        Total_Amount: 0,
        Items: [] // Ban đầu giỏ hàng rỗng
      });
      await cart.save();
      console.log(`Đã tạo giỏ hàng mới cho người dùng ${cartIdString}`);
    }

    // Kiểm tra sản phẩm
    const product = await Product.findById(productObjectId);
    if (!product) {
      return errorResponse(res, 'Không tìm thấy sản phẩm', HTTP_STATUS.NOT_FOUND);
    }

    // Kiểm tra số lượng tồn kho
    if (product.Stock < quantity) {
      return errorResponse(res, 'Số lượng sản phẩm trong kho không đủ', HTTP_STATUS.BAD_REQUEST);
    }

    // Kiểm tra mục đã tồn tại trong giỏ hàng
    let cartItem = await CartItem.findOne({
      CartID: cartId, // Sử dụng ObjectId
      ProductID: productObjectId // Sử dụng ObjectId
    });

    if (cartItem) {
      // Cập nhật số lượng nếu mục đã tồn tại
      cartItem.quantity += quantity;
      cartItem.Total_Price = cartItem.quantity * cartItem.Unit_Price;
    } else {
      // Tạo mục mới nếu chưa tồn tại
      cartItem = new CartItem({
        CartID: cartId, // Sử dụng ObjectId
        ProductID: productObjectId, // Sử dụng ObjectId
        quantity,
        Unit_Price: product.Price,
        Total_Price: product.Price * quantity,
        Image: product.Main_Image
      });
    }

    await cartItem.save();

    // Cập nhật tổng tiền giỏ hàng
    await Cart.findByIdAndUpdate(cartId, {
      $inc: { Total_Amount: product.Price * quantity }
    });

    successResponse(res, cartItem, 'Thêm sản phẩm vào giỏ hàng thành công');
  } catch (error) {
    console.error('Chi tiết lỗi thêm sản phẩm vào giỏ hàng:', error); // Log chi tiết lỗi
    errorResponse(res, 'Lỗi thêm sản phẩm vào giỏ hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Cập nhật mục trong giỏ hàng
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { cartId, cartItemId } = req.params;

    const cartItem = await CartItem.findById(cartItemId);
    if (!cartItem) {
      return errorResponse(res, 'Không tìm thấy mục trong giỏ hàng', HTTP_STATUS.NOT_FOUND);
    }

    // Kiểm tra sản phẩm
    const product = await Product.findById(cartItem.ProductID);
    if (!product) {
      return errorResponse(res, 'Không tìm thấy sản phẩm', HTTP_STATUS.NOT_FOUND);
    }

    // Kiểm tra số lượng tồn kho
    if (product.Stock < quantity) {
      return errorResponse(res, 'Số lượng sản phẩm trong kho không đủ', HTTP_STATUS.BAD_REQUEST);
    }

    // Cập nhật số lượng và tổng tiền
    const oldTotal = cartItem.Total_Price;
    cartItem.quantity = quantity;
    cartItem.Total_Price = quantity * cartItem.Unit_Price;
    await cartItem.save();

    // Cập nhật tổng tiền giỏ hàng
    await Cart.findByIdAndUpdate(cartId, {
      $inc: { Total_Amount: cartItem.Total_Price - oldTotal }
    });

    successResponse(res, cartItem, 'Cập nhật giỏ hàng thành công');
  } catch (error) {
    errorResponse(res, 'Lỗi cập nhật giỏ hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Xóa mục khỏi giỏ hàng
const deleteCartItem = async (req, res) => {
  try {
    const { cartId, cartItemId } = req.params;

    // Find and delete the cart item in one operation
    const cartItem = await CartItem.findOneAndDelete({ _id: cartItemId, CartID: cartId });

    if (!cartItem) {
      return errorResponse(res, 'Không tìm thấy mục trong giỏ hàng hoặc không thuộc giỏ hàng này', HTTP_STATUS.NOT_FOUND);
    }

    // Update total amount in the Cart
    await Cart.findByIdAndUpdate(cartId, {
      $inc: { Total_Amount: -cartItem.Total_Price }
    });

    successResponse(res, null, 'Xóa sản phẩm khỏi giỏ hàng thành công');
  } catch (error) {
    console.error('Error deleting cart item:', error);
    errorResponse(res, 'Lỗi xóa sản phẩm khỏi giỏ hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

module.exports = {
  getCartItems,
  addCartItem,
  updateCartItem,
  deleteCartItem
}; 