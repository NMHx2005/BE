const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart, removeCartItemByUserAndItemId } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// All cart routes require authentication
router.use(protect);

// Get user's cart
router.get('/', getCart);

// Add item to cart
router.post('/items', addToCart);

// Update cart item quantity
router.put('/items/:itemId', updateCartItem);

// Remove item from cart
router.delete('/items/:itemId', removeFromCart);

// Clear cart
router.delete('/', clearCart);

// --- New route to match frontend DELETE /api/gio-hang/:userId/muc/:itemId ---
// Note: Authentication needs careful consideration here. The protect middleware uses req.user._id.
// If the intent is to allow an admin to delete items from another user's cart, auth logic needs adjustment.
// Assuming for now that the authenticated user (req.user._id) must match the userId in the params.
router.delete('/:userId/muc/:itemId', removeCartItemByUserAndItemId);

module.exports = router; 