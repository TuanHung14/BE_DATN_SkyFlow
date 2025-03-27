const multer = require('multer');
const sharp = require('sharp');
const User = require('../model/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handleFactory');


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
    if(req.body.password || req.body.passwordConfirmation) {
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword', 400));
    }

    //Sử dụng filterObj để chỉ lấy ra các field cần thiết
    const filteredBody = filterObj(req.body, 'name', 'email');

    const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status:'success',
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, {
        isActive: false,
    });
    res.status(204).json({
        status:'success',
        data: null
    });
});

exports.getAllUsers =Factory.getAll(User);
exports.getUser = Factory.getOne(User);
exports.updateUser = Factory.updateOne(User);
exports.deleteUser = Factory.deleteOne(User);

