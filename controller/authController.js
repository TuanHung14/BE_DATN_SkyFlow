const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const {promisify} = require('util');
const otpService = require('../services/otpService');
const resetPasswordService = require('../services/resetPasswordService');
const userService = require('../services/userService');

exports.refreshToken = catchAsync(async (req, res, next) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return next(new AppError('Vui lòng đăng nhập lại!', 401));
    }

    const decoded = await promisify(jwt.verify)(refreshToken, process.env.JWT_REFRESH_SECRET);

    const currentUser = await User.findById(decoded.id, "+refreshToken");

    if (!currentUser) {
        return next(new AppError('Token thuộc về người dùng này không còn tồn tại nữa', 401));
    }

    if (currentUser.refreshToken !== refreshToken) {
        return next(new AppError('Phiên đăng nhập của bạn không hợp lệ, vui lòng đăng nhập lại.', 403));
    }

    res.clearCookie('refreshToken');

    await userService.createSendToken(currentUser, 200, res);
});

exports.signup = catchAsync(async (req, res, next) => {
    const {name, email, password} = req.body;

    if(!name || !email || !password) {
        return next(new AppError('Vui lòng cung cấp email, tên và mật khẩu', 400));
    }

    const newUser = await User.create({
        name,
        email,
        password
    });

    const otp = await otpService.generateOTP('register', newUser._id);

    await new Email(newUser, otp).sendWelcome();

    res.status(201).json({
        status:'success',
        message: 'Bạn đã đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản',
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;
    if(!email ||!password) {
        return next(new AppError('Vui lòng cung cấp email và mật khẩu', 400));
    }

    const user = await userService.findUser(email, '+password');

    if(!user ||!(await user.correctPassword(password, user.password))) {
        return next(new AppError('Email hoặc mật khẩu không chính xác', 401));
    }

    if(!user.isVerified){
        return next(new AppError('Tài khoản của bạn chưa được xác thực! Vui lòng kiểm tra email', 401));
    }


    await userService.createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    res.clearCookie('refreshToken');
    const payload = {
        refreshToken: null
    }
    await userService.updateOne(userId, payload);
    res.status(200).json({ status:'success', message: 'Logged out successfully' });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const {email} = req.body;
    const user = await userService.findUser(email);

    if(!user) {
        return next(new AppError('Không tìm thấy người dùng nào với email này!', 404));
    }

    if(!user.isVerified){
        return next(new AppError('Tài khoản của bạn chưa được xác thực! Vui lòng kiểm tra email', 401));
    }

    const forgotOtp = await otpService.generateOTP("forgotPassword", user._id);

    try {
        await new Email(user, forgotOtp).sendPasswordReset();
        
        res.status(200).json({
            status:'success',
            message: 'OTP đã gửi đến email của bạn. Vui lòng kiểm tra email để đặt lại mật khẩu',
        });
    } catch (error) {
        await otpService.clearOTP("forgotPassword", user._id);
        return next(new AppError('Đã xảy ra lỗi khi gửi email. Vui lòng thử lại sau', 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;

    if(!email || !password) {
        return next(new AppError('Vui lòng cung cấp email và mật khẩu mới', 400));
    }

    const user = await userService.findUser(email);

    if(!user) {
        return next(new AppError('Không tìm thấy người dùng nào với email này!', 404));
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    
    const isValidToken = await resetPasswordService.verifyResetPassword(user.id, hashedToken);
    
    if(!isValidToken) {
        return next(new AppError('Token không hợp lệ hoặc đã hết hạn', 400));
    }

    user.password = password;
    await user.save();

    return res.status(200).json({
        status:'success',
        message: 'Mật khẩu đã được đặt lại thành công!',
    })
});

exports.updatePassword = catchAsync(async (req, res, next) => { 
    const user = await User.findById(req.user.id).select('+password');
    
    if(!user || !(await user.correctPassword(req.body.currentPassword, user.password))) {
        return next(new AppError('Mật khẩu hiện tại của bạn bị sai', 401));
    }
    
    user.password = req.body.password;
    await user.save();

    await userService.createSendToken(user, 200, res);
});

exports.setPassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password +googleId');

    if(!user){
        return next(new AppError('Người dùng không tồn tại', 401));
    }

    if(user.password !== null){
        return next(new AppError('Người dùng đã có mật khẩu', 401));
    }

    user.password = req.body.password;
    user.isUpdatePassword = true;
    await user.save();

    await userService.createSendToken(user, 200, res);
})

exports.googleLogin = catchAsync(async (req, res, next) => {
    const { token } = req.body;

    const payload = await userService.verifyToken(token);

    const { email, name, sub, picture } = payload;

    let account = await userService.findUser(email, "+password");
    if(!account) {
        account = await User.create({
            name,
            email,
            photo: picture,
            googleId: sub,
            isVerified: true,
        });
    }else if(!account.googleId) {
        account.googleId = sub;
        account.isVerified = true;
        await account.save();
    }

    await userService.createSendToken(account, 200, res);
});