const Cart = require('../models/Cart');
// const CartItem = require('../models/CartItem'); // CartItem model might not be needed if embedding items
const { successResponse, errorResponse, HTTP_STATUS } = require('../utils/responseHandler');

// Import Product model if needed for price lookup when adding items
const Product = require('../models/Product');
const CartItem = require('../models/CartItem');

// Get user cart
const getUserCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find the user's active cart. Ensure only one active cart exists.
    const carts = await Cart.find({ UserID: userId, Status: 'active' }).populate('items.ProductID');

    let cart = null;

    if (carts.length > 1) {
      // More than one active cart found, which is an inconsistent state.
      // Log a warning and try to pick the most recently updated one or handle as an error.
      console.warn(`Multiple active carts found for user ${userId}. Using the most recently updated one.`);
      // Sort by updatedAt descending and pick the first one
      carts.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      cart = carts[0];
      // Optionally, you might want to deactivate the other carts here
      // for (let i = 1; i < carts.length; i++) { carts[i].Status = 'inactive'; await carts[i].save(); }

    } else if (carts.length === 1) {
      // Exactly one active cart found
      cart = carts[0];
    }

    if (!cart) {
      // No active cart found, return empty items array
      return successResponse(res, { data: { data: [] } });
    }

    // Return the embedded items array with consistent data structure
    successResponse(res, { data: { data: cart.items } });
  } catch (error) {
    console.error('Error in getUserCart:', error);
    errorResponse(res, 'Lỗi lấy giỏ hàng hoạt động', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Create/Update cart (add or update item)
const createOrUpdateCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.params.userId;

    console.log('Received data in createOrUpdateCart: ', { userId, productId, quantity });

    // Find the user's active cart. Ensure only one active cart exists.
    let cart = await Cart.findOne({ UserID: userId, Status: 'active' });

    console.log('Cart found (before update) in createOrUpdateCart:', cart);

    if (!cart) {
      // If no active cart, create a new one
      cart = new Cart({
        UserID: userId,
        items: [],
        Status: 'active'
      });
      console.log('New active cart created:', cart);
    } else {
      // If an active cart is found, check if there are other active carts (should not happen but for robustness)
      const otherActiveCarts = await Cart.find({ UserID: userId, Status: 'active', _id: { $ne: cart._id } });
      if (otherActiveCarts.length > 0) {
        console.warn(`Found ${otherActiveCarts.length} other active carts for user ${userId} while updating.`);
        // Deactivate other active carts to maintain data consistency
        for (const otherCart of otherActiveCarts) {
          otherCart.Status = 'inactive';
          await otherCart.save();
          console.log(`Deactivated duplicate active cart: ${otherCart._id}`);
        }
      }
    }

    // Find the product details
    const product = await Product.findById(productId);
    if (!product) {
        console.error('Product not found:', productId);
        return errorResponse(res, 'Không tìm thấy sản phẩm', HTTP_STATUS.NOT_FOUND);
    }

    // Find the item in the embedded items array
    let itemIndex = cart.items.findIndex(item => item.ProductID.toString() === productId);

    if (itemIndex > -1) {
      // Item exists, update quantity and total price
      cart.items[itemIndex].quantity += quantity;
      cart.items[itemIndex].priceAtOrder = product.Price; // Ensure price is current
    } else {
      // Item does not exist, add new embedded item
      cart.items.push({
        ProductID: product._id,
        quantity: quantity,
        priceAtOrder: product.Price,
        Image: product.Main_Image,
      });
    }

    // Recalculate total amount
    cart.Total_Amount = cart.items.reduce((sum, item) => sum + item.priceAtOrder * item.quantity, 0);

    await cart.save();

    console.log('Cart saved (after update) in createOrUpdateCart:', cart);

    // Populate product details before sending response
    await cart.populate('items.ProductID');

    successResponse(res, cart, 'Cập nhật giỏ hàng thành công');
  } catch (error) {
    console.error('Error in createOrUpdateCart:', error);
    errorResponse(res, 'Lỗi cập nhật giỏ hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Update cart (e.g., status, or updating quantity of a specific item if needed)
// This function might need more specific logic depending on how PUT /api/gio-hang/:userId is used
// For now, keeping it simple based on previous implementation.
const updateCart = async (req, res) => {
  try {
    const { Status, items } = req.body; // Expecting Status or updated items array
    const userId = req.params.userId;

    const cart = await Cart.findOne({ UserID: userId, Status: 'active' });

    if (!cart) {
      return errorResponse(res, 'Không tìm thấy giỏ hàng hoạt động', HTTP_STATUS.NOT_FOUND);
    }

    if (Status) {
        cart.Status = Status;
    }

    // If an updated items array is sent, replace the existing one and recalculate total
    if (items && Array.isArray(items)) {
        cart.items = items;
        cart.Total_Amount = cart.items.reduce((sum, item) => sum + item.priceAtOrder * item.quantity, 0);
    }
    
    await cart.save();

    // Populate product details before returning
    await cart.populate('items.ProductID');

    successResponse(res, cart, 'Cập nhật giỏ hàng thành công');
  } catch (error) {
    console.error('Error in updateCart:', error);
    errorResponse(res, 'Lỗi cập nhật giỏ hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Delete cart
const deleteCart = async (req, res) => {
  try {
    // Find and delete the active cart for the user
    const cart = await Cart.findOneAndDelete({ UserID: req.params.userId, Status: 'active' });
    if (!cart) {
      // It's okay if no active cart is found to delete
      return successResponse(res, null, 'Không có giỏ hàng hoạt động để xóa', HTTP_STATUS.OK);
    }
    successResponse(res, null, 'Xóa giỏ hàng hoạt động thành công');
  } catch (error) {
    console.error('Error in deleteCart:', error);
    errorResponse(res, 'Lỗi xóa giỏ hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Function to update total amount (might be less necessary now with embedded items)
// const updateCartTotal = async (cartId) => { ... };

module.exports = {
  getUserCart,
  createOrUpdateCart,
  updateCart,
  deleteCart,
  // updateCartTotal // Not needed with embedded items
}; 