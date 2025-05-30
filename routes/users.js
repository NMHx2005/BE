const express = require('express');
const router = express.Router();
const { register, login, logout, getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/usersController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);

router.route('/')
  .get(protect, authorize('admin'), getAllUsers);

router.route('/:userId')
  .get(protect, getUserById)
  .put(protect, updateUser)
  .delete(protect, authorize('admin'), deleteUser);

module.exports = router; 