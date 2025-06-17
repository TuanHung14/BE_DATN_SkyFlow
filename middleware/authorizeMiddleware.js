const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const authorize = (requiredPermission) => catchAsync(async (req, res, next) => {
    const user = req.user;

    if(!user.role || !user.role.isActive){
        next(new AppError("Vai trò của người dùng không hợp lệ hoặc đã bị vô hiệu hóa", 401));
    }

    const permissionList = [];

    for (const permission of user.role.permission) {
        permissionList.push(permission.name);
    }

    const hasPermission = permissionList.includes(requiredPermission);

    if(!hasPermission){
        return next(new AppError("Bạn không có quyền thực hiện hành động này", 403));
    }

    next();
})

module.exports = authorize;