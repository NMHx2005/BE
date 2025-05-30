const express = require('express');
const router = express.Router();
const { getUserRoles, assignRoleToUser, removeRoleFromUser } = require('../controllers/roleUsersController');

router.get('/nguoi-dung/:userId/vai-tro', getUserRoles);
router.post('/nguoi-dung/:userId/vai-tro', assignRoleToUser);
router.delete('/nguoi-dung/:userId/vai-tro/:roleId', removeRoleFromUser);

module.exports = router; 