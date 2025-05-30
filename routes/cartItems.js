const express = require('express');
const router = express.Router();
const { getCartItems, addCartItem, updateCartItem, deleteCartItem } = require('../controllers/cartItemsController');

router.get('/:cartId/muc', getCartItems);
router.post('/:cartId/items', addCartItem);
router.put('/:cartId/muc/:cartItemId', updateCartItem);
router.delete('/:cartId/muc/:cartItemId', deleteCartItem);

module.exports = router; 