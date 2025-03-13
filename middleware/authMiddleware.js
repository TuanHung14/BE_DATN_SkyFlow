const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require('../model/userModel');



const auth = catchAsync(async (req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if(!token) {
        return next(new AppError('You are not logged in', 401));
    }
    // promisify để chuyển hàm jwt.verify thành promises
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_ACCESS_SECRET);
    
    const currentUser = await User.findById(decoded.id);

    if(!currentUser) {
        return next(new AppError('The token belonging to this User does no longer exists', 401));
    }

    if(currentUser.changePasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please log in again', 401));
    }

    req.user = currentUser;
    next();
})

// eslint-disable-next-line arrow-body-style
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next(); 
    }
}

module.exports = {
    auth,
    restrictTo
};