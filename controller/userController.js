const User = require('../model/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handleFactory');
const userService = require("../services/userService");


const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    })
    return newObj;
};


exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.updateMe = catchAsync(async (req, res, next) => {
    if(req.body.password) {
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword', 400));
    }


    //Sử dụng filterObj để chỉ lấy ra các field cần thiết
    const filteredBody = filterObj(req.body, 'name', 'email', 'photo', 'phone', 'dateOfBirth');

    const updatedUser = await userService.updateOne(req.user._id, filteredBody, true);

    res.status(200).json({
        status:'success',
        data: {
            user: updatedUser
        }
    });
});

// exports.deleteMe = catchAsync(async (req, res, next) => {
//     await User.findByIdAndUpdate(req.user._id, {
//         isActive: false,
//     });
//     res.status(204).json({
//         status:'success',
//         data: null
//     });
// });
exports.fieldCreate = (req, res, next) => {
    req.body = filterObj(req.body, 'name', 'email', 'password', 'role');
    req.body.isVerified = true;
    next();
}

exports.fieldUpdate = (req, res, next) => {
    req.body = filterObj(req.body, 'name', 'email', 'photo', 'role');
    next();
}


exports.getAllUsers = Factory.getAll(User, 'role');
exports.createUser = Factory.createOne(User);
exports.getUser = Factory.getOne(User, 'role');
exports.updateUser = Factory.updateOne(User);
// exports.deleteUser = Factory.deleteOne(User);

