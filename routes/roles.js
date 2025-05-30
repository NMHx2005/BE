const express = require('express');
const router = express.Router();
const { getRoles, getRoleById, createRole, updateRole, deleteRole } = require('../controllers/rolesController');

router.get('/', getRoles);
router.get('/:roleId', getRoleById);
router.post('/', createRole);
router.put('/:roleId', updateRole);
router.delete('/:roleId', deleteRole);

module.exports = router; 