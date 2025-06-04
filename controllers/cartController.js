const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const { successResponse, errorResponse, HTTP_STATUS } = require('../utils/responseHandler');

// @desc    Get user's active cart
// @route   GET /api/gio-hang
// @access  Private
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ UserID: req.user._id, Status: 'active' })
      .populate({
        path: 'items',
        populate: {
          path: 'ProductID',
          select: 'Product_Name Price Main_Image'
        }
      });

    if (!cart) {
      // Create new cart if none exists
      const newCart = new Cart({
        UserID: req.user._id,
        Status: 'active',
        items: []
      });
      await newCart.save();
      return successResponse(res, newCart);
    }

    successResponse(res, cart);
  } catch (error) {
    console.error('Error getting cart:', error);
    errorResponse(res, 'Lỗi khi lấy thông tin giỏ hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// @desc    Add item to cart
// @route   POST /api/gio-hang/items
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse(res, 'Sản phẩm không tồn tại', HTTP_STATUS.NOT_FOUND);
    }

    // Get or create cart
    let cart = await Cart.findOne({ UserID: req.user._id, Status: 'active' });
    if (!cart) {
      cart = new Cart({
        UserID: req.user._id,
        Status: 'active',
        items: []
      });
    }

    // Check if item already exists in cart (using embedded items)
    const existingItem = cart.items.find(item => item.ProductID.toString() === productId);

    if (existingItem) {
      // Update quantity and price if item exists in embedded array
      existingItem.quantity += quantity;
      existingItem.priceAtOrder = product.Price; // Update price to current product price
    } else {
      // Add new item to embedded items array
      cart.items.push({
        ProductID: productId,
        quantity,
        priceAtOrder: product.Price, // Store price at the time of adding
        Image: product.Main_Image // Store image URL
      });
    }

    await cart.save(); // Save the updated cart document

    // Update cart total
    await updateCartTotal(cart._id);

    // Return updated cart with populated product details
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.ProductID',
        select: 'Product_Name Price Main_Image'
      });

    successResponse(res, updatedCart, 'Đã thêm sản phẩm vào giỏ hàng');
  } catch (error) {
    console.error('Error adding to cart:', error);
    errorResponse(res, 'Lỗi khi thêm sản phẩm vào giỏ hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/gio-hang/items/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params; // itemId is the _id of the embedded item

    // Find the user's active cart
    const cart = await Cart.findOne({ UserID: req.user._id, Status: 'active' });

    if (!cart) {
      return errorResponse(res, 'Không tìm thấy giỏ hàng', HTTP_STATUS.NOT_FOUND);
    }

    // Find the embedded item by its _id
    const itemToUpdate = cart.items.id(itemId); // Mongoose provides .id() for embedded documents

    if (!itemToUpdate) {
      return errorResponse(res, 'Không tìm thấy sản phẩm trong giỏ hàng', HTTP_STATUS.NOT_FOUND);
    }

    // Update the quantity
    itemToUpdate.quantity = quantity;

    // Save the updated cart document
    await cart.save();

    // Update cart total
    await updateCartTotal(cart._id);

    // Return updated cart with populated product details
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.ProductID',
        select: 'Product_Name Price Main_Image'
      });

    successResponse(res, updatedCart, 'Đã cập nhật số lượng sản phẩm');
  } catch (error) {
    console.error('Error updating cart item:', error);
    errorResponse(res, 'Lỗi khi cập nhật số lượng sản phẩm', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/gio-hang/items/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cartItem = await CartItem.findById(itemId);
    if (!cartItem) {
      return errorResponse(res, 'Không tìm thấy sản phẩm trong giỏ hàng', HTTP_STATUS.NOT_FOUND);
    }

    // Verify cart belongs to user
    const cart = await Cart.findById(cartItem.CartID);
    if (cart.UserID.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Không được phép xóa sản phẩm khỏi giỏ hàng này', HTTP_STATUS.FORBIDDEN);
    }

    // Remove item from cart
    cart.items = cart.items.filter(item => item.toString() !== itemId);
    await cart.save();

    // Delete cart item
    await CartItem.findByIdAndDelete(itemId);

    // Update cart total
    await updateCartTotal(cart._id);

    // Return updated cart
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items',
        populate: {
          path: 'ProductID',
          select: 'Product_Name Price Main_Image'
        }
      });

    successResponse(res, updatedCart, 'Đã xóa sản phẩm khỏi giỏ hàng');
  } catch (error) {
    console.error('Error removing from cart:', error);
    errorResponse(res, 'Lỗi khi xóa sản phẩm khỏi giỏ hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// @desc    Clear cart
// @route   DELETE /api/gio-hang
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ UserID: req.user._id, Status: 'active' });
    if (!cart) {
      return errorResponse(res, 'Không tìm thấy giỏ hàng', HTTP_STATUS.NOT_FOUND);
    }

    // Delete all cart items
    await CartItem.deleteMany({ CartID: cart._id });

    // Clear cart items array and reset total
    cart.items = [];
    cart.Total_Amount = 0;
    await cart.save();

    successResponse(res, cart, 'Đã xóa tất cả sản phẩm khỏi giỏ hàng');
  } catch (error) {
    console.error('Error clearing cart:', error);
    errorResponse(res, 'Lỗi khi xóa giỏ hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// @desc    Remove item from cart by UserID and ItemID
// @route   DELETE /api/gio-hang/:userId/muc/:itemId
// @access  Private (assuming auth middleware handles user identification)
const removeCartItemByUserAndItemId = async (req, res) => {
  try {
    const { userId, itemId } = req.params;

    // Find the user's active cart using userId from parameters
    // Note: If using protect middleware, req.user._id is available.
    // We need to decide if the userId in the URL *must* match req.user._id
    // or if this endpoint is for admin to manage carts by userId.
    // Assuming for now that the authenticated user (req.user._id) must match the userId in the params.
    if (req.user && req.user._id.toString() !== userId) {
         return errorResponse(res, 'Không được phép xóa sản phẩm khỏi giỏ hàng của người dùng khác', HTTP_STATUS.FORBIDDEN);
    }

    const cart = await Cart.findOne({ UserID: userId, Status: 'active' });

    if (!cart) {
      return errorResponse(res, 'Không tìm thấy giỏ hàng của người dùng này', HTTP_STATUS.NOT_FOUND);
    }

    // Find the index of the embedded item by its _id (itemId)
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

    if (itemIndex === -1) {
      return errorResponse(res, 'Không tìm thấy sản phẩm trong giỏ hàng', HTTP_STATUS.NOT_FOUND);
    }

    // Remove the item from the embedded array
    cart.items.splice(itemIndex, 1);

    // Save the updated cart document
    await cart.save();

    // Update cart total
    await updateCartTotal(cart._id); // Use the existing helper function

    // Return updated cart with populated product details (optional, but useful for frontend update)
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.ProductID',
        select: 'Product_Name Price Main_Image'
      });


    successResponse(res, updatedCart, 'Đã xóa sản phẩm khỏi giỏ hàng');

  } catch (error) {
    console.error('Error removing item by user and item ID:', error);
    // Log full error response if available for debugging
    if (error.response) {
       console.error('Error response data:', error.response.data);
       console.error('Error response status:', error.response.status);
       console.error('Error response headers:', error.response.headers);
    }
    errorResponse(res, 'Lỗi khi xóa sản phẩm khỏi giỏ hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};

// Helper function to update cart total
const updateCartTotal = async (cartId) => {
  try {
    const cart = await Cart.findById(cartId).populate({
      path: 'items.ProductID', // Populate ProductID within the embedded items
      select: 'Price'
    });

    // Kiểm tra nếu giỏ hàng không tồn tại
    if (!cart) {
      console.error(`Cart with ID ${cartId} not found.`);
      return; // Không làm gì nếu không tìm thấy giỏ hàng
    }

    // Kiểm tra nếu items là null hoặc undefined
    if (!cart.items) {
        cart.Total_Amount = 0;
        await cart.save();
        return; // Reset total nếu không có items
    }

    const total = cart.items.reduce((sum, item) => {
      // Kiểm tra nếu item hoặc ProductID hoặc priceAtOrder là null/undefined
      // Sử dụng priceAtOrder từ embedded document để tính tổng
      if (!item || item.priceAtOrder === undefined || item.priceAtOrder === null) {
          console.warn(`Skipping item with invalid price data in cart ${cartId}`);
          return sum; // Bỏ qua item lỗi
      }
      return sum + (item.priceAtOrder * (item.quantity || 0)); // Sử dụng 0 nếu quantity undefined
    }, 0);

    cart.Total_Amount = total;
    await cart.save();
  } catch (error) {
    console.error('Error updating cart total:', error);
    throw error; // Rethrow error to be caught by calling function
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  removeCartItemByUserAndItemId
}; 