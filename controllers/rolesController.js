const Role = require('../models/Role');
const { successResponse, errorResponse, HTTP_STATUS } = require('../utils/responseHandler');

// Lấy danh sách vai trò
const getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    successResponse(res, roles);
  } catch (error) {
    errorResponse(res, 'Lỗi lấy danh sách vai trò', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Lấy thông tin vai trò theo ID
const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.roleId);
    if (!role) {
      return errorResponse(res, 'Không tìm thấy vai trò', HTTP_STATUS.NOT_FOUND);
    }
    successResponse(res, role);
  } catch (error) {
    errorResponse(res, 'Lỗi lấy thông tin vai trò', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Tạo vai trò mới
const createRole = async (req, res) => {
  try {
    const { Role_Name, Role_Description, Permissions } = req.body;
    const role = new Role({ Role_Name, Role_Description, Permissions });
    await role.save();
    successResponse(res, role, 'Tạo vai trò thành công', HTTP_STATUS.CREATED);
  } catch (error) {
    errorResponse(res, 'Lỗi tạo vai trò', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Cập nhật vai trò
const updateRole = async (req, res) => {
  try {
    const { Role_Name, Role_Description, Permissions } = req.body;
    const role = await Role.findById(req.params.roleId);
    if (!role) {
      return errorResponse(res, 'Không tìm thấy vai trò', HTTP_STATUS.NOT_FOUND);
    }
    role.Role_Name = Role_Name;
    role.Role_Description = Role_Description;
    role.Permissions = Permissions;
    await role.save();
    successResponse(res, role, 'Cập nhật vai trò thành công');
  } catch (error) {
    errorResponse(res, 'Lỗi cập nhật vai trò', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Xóa vai trò
const deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.roleId);
    if (!role) {
      return errorResponse(res, 'Không tìm thấy vai trò', HTTP_STATUS.NOT_FOUND);
    }
    successResponse(res, null, 'Xóa vai trò thành công');
  } catch (error) {
    errorResponse(res, 'Lỗi xóa vai trò', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

module.exports = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
}; 