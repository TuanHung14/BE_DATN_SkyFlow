const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const userService = require("../services/userService");



const auth = catchAsync(async (req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if(!token) {
        return next(new AppError('Bạn chưa đăng nhập', 401));
    }
    // promisify để chuyển hàm jwt.verify thành promises
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_ACCESS_SECRET);

    const currentUser = await userService.findUserById(decoded.id);

    if(!currentUser) {
        return next(new AppError('Token thuộc về người dùng này không còn tồn tại', 401));
    }

    if(currentUser.changePasswordAfter(decoded.iat)) {
        return next(new AppError('Người dùng gần đây đã thay đổi mật khẩu! Vui lòng đăng nhập lại', 401));
    }

    req.user = currentUser;
    next();
})

module.exports = auth;