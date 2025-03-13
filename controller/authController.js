const {OAuth2Client} = require('google-auth-library');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const {promisify} = require('util');


const signToken = user => {
    const accessToken = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });
    return {
        'access_token': accessToken,
        'refresh_token': refreshToken
    };
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user);

    // Lưu vào database refresh token
    //................................................................

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true, // Trình duyệt không thể truy cập hoặc sửa đổi cookie theo bất kỳ cách nào
    };

    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('refreshToken', token.refresh_token, cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status:'success',
        token,
        data: {
            user: user
        }
    });
}

const verifyToken = async (token) => {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    return payload;
}

exports.refreshToken = catchAsync(async (req, res, next) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return next(new AppError('You are not logged in', 401));
    }

    const decoded = await promisify(jwt.verify)(refreshToken, process.env.JWT_REFRESH_SECRET);

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
        return next(new AppError('The token belonging to this User does no longer exists', 401));
    }
    res.clearCookie('refreshToken');

    // Lưu vào database
    //................................................................

    createSendToken(currentUser, 200, res);
});

exports.signup = catchAsync(async (req, res, next) => {
    // const {name, email, password, passwordConfirmation } = req.body;

    const newUser = await User.create(req.body);

    const url = `${req.protocol}://${req.get('host')}/me`;

    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 201, res);
});


exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;
    if(!email ||!password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select( "+password" );

    if(!user ||!(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
    res.clearCookie('refreshToken');
    res.status(200).json({ status:'success', message: 'Logged out successfully' });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const {email} = req.body;
    const user = await User.findOne({ email });
    if(!user) {
        return next(new AppError('No user found with that email', 404));
    }
    const resetToken = user.createPasswordResetToken();

    //Không check lại những validate nữa
    await user.save({ validateBeforeSave: false });
 
    
    try {
        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user, resetUrl).sendPasswordReset();
        
        res.status(200).json({
            status:'success',
            message: 'Token sent to email'
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('There was an error sending email. Please try again later', 500));
    }
});


exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex'); 
    
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    
    if(!user) {
        return next(new AppError('Invalid token or token expired', 400));
    }
    
    user.password = req.body.password;
    user.passwordConfirmation = req.body.passwordConfirmation;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => { 
    const user = await User.findById(req.user.id).select('+password');
    
    if(!user ||!(await user.correctPassword(req.body.currentPassword, user.password))) {
        return next(new AppError('Your current password is wrong', 401));
    }
    
    user.password = req.body.password;
    user.passwordConfirmation = req.body.passwordConfirmation;
    await user.save();

    createSendToken(user, 200, res);
});

exports.googleLogin = catchAsync(async (req, res, next) => {
    const { token } = req.body;

    const payload = await verifyToken(token);

    const { email, name, sub } = payload;

    let account = await User.findOne({ email, googleId: sub });
    if(!account) {
        account = await User.create({
            name,
            email,
            googleId: sub,
            authProvider: "google",
        });
    }

    createSendToken(account, 200, res);
});