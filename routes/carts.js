const express = require('express');
const router = express.Router();
const { getUserCart, createOrUpdateCart, updateCart, deleteCart } = require('../controllers/cartsController');

// Routes for Cart, now mounted at /api/gio-hang
// Endpoint to get user's active cart: GET /api/gio-hang/:userId
router.get('/:userId', getUserCart);

// Endpoint to create or update user's cart (e.g., add item): POST /api/gio-hang/:userId
// REMOVED: This route conflicts with item-level operations handled by cartController.js
// router.post('/:userId', createOrUpdateCart);

// Endpoint to update user's cart (e.g., status): PUT /api/gio-hang/:userId
router.put('/:userId', updateCart);

// Endpoint to delete user's cart: DELETE /api/gio-hang/:userId
router.delete('/:userId', deleteCart);

// Note: Individual cart item operations (add, update, delete item) are handled
// by cartController.js, which is also mounted at /api/gio-hang.
// Endpoints are like:
// POST /api/gio-hang/items (add item to cart)
// PUT /api/gio-hang/items/:itemId (update specific item quantity)
// DELETE /api/gio-hang/items/:itemId (delete specific item)

module.exports = router; 