const RoleUser = require('../models/RoleUser');
const { successResponse, errorResponse, HTTP_STATUS } = require('../utils/responseHandler');

// Lấy tất cả vai trò của một người dùng
const getUserRoles = async (req, res) => {
  try {
    const { userId } = req.params;
    const roles = await RoleUser.find({ UserID: userId }).populate('RoleID');
    successResponse(res, roles);
  } catch (error) {
    errorResponse(res, 'Lỗi lấy vai trò người dùng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Gán vai trò cho người dùng
const assignRoleToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { RoleID } = req.body;
    const roleUser = new RoleUser({ UserID: userId, RoleID });
    await roleUser.save();
    successResponse(res, roleUser, 'Gán vai trò thành công', HTTP_STATUS.CREATED);
  } catch (error) {
    errorResponse(res, 'Lỗi gán vai trò', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Xóa vai trò khỏi người dùng
const removeRoleFromUser = async (req, res) => {
  try {
    const { userId, roleId } = req.params;
    const roleUser = await RoleUser.findOneAndDelete({ UserID: userId, RoleID: roleId });
    if (!roleUser) {
      return errorResponse(res, 'Không tìm thấy vai trò người dùng', HTTP_STATUS.NOT_FOUND);
    }
    successResponse(res, null, 'Xóa vai trò khỏi người dùng thành công');
  } catch (error) {
    errorResponse(res, 'Lỗi xóa vai trò khỏi người dùng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

module.exports = {
  getUserRoles,
  assignRoleToUser,
  removeRoleFromUser
}; 