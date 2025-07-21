const VoucherUse = require("../model/voucherUseModel");
const Voucher = require("../model/voucherModel");
const User = require("../model/userModel");
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.buyVoucher = catchAsync(async (req, res, next) => {
    const { voucherId, quantity } = req.body;
    const userId = req.user._id;

    if (quantity < 1) {
        return next(new AppError('Số lượng không được âm', 400));
    }

    // Kiểm tra xem voucher có tồn tại không và lấy giá bán của voucher
    const voucher = await Voucher.findById(voucherId);

    // Lấy memberPoint của người dùng
    const user = await User.findById(userId);

    // Check xem người dùng có đủ điểm để mua voucher không
    if( user.memberShipPoints < (voucher.points * quantity)) {
        return next(new AppError('Bạn không đủ điểm để mua voucher này', 400));
    }

    // Kiểm tra xem voucher đã được sử dụng bởi người dùng này chưa
    const voucherUse = await VoucherUse.findOneAndUpdate(
        { userId: userId, voucherId: voucherId },
        { $inc: { usageLimit: quantity } },
        { new: true, upsert: true }
    );

    // Trừ điểm của người dùng
    user.memberShipPoints -= (voucher.points * quantity);
    await user.save();

    res.status(200).json({
        status: 'success',
        data: {
            voucherUse
        }
    });
});

exports.getVoucherUsage = catchAsync(async (req, res, next) => {
    const userId = req.user._id;

    // Lấy tất cả voucher đã sử dụng của người dùng
    const voucherUsages = await VoucherUse.find({ userId: userId, $expr: { $lt: ["$usageCount", "$usageLimit"] } })
        .populate('voucherId', 'voucherCode voucherName discountValue description imageUrl')

    res.status(200).json({
        status: 'success',
        data: {
            data: voucherUsages
        }
    });
});