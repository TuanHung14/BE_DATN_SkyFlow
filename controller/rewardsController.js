const Factory = require('./handleFactory')
const Rewards = require('../model/rewardsModel')
const User = require('../model/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const VoucherUse = require("../model/voucherUseModel");
const Voucher = require("../model/voucherModel");
const Level = require("../model/levelModel");
const Email = require("../utils/email");
const mongoose = require("mongoose");
const APIFeatures = require("../utils/apiFeatures");

exports.getFieldGetClient = (req, res, next) => {
    req.query.active = true;
    next();
}

exports.createReward = catchAsync(async (req, res, next) => {
    const { name, type, value, voucherId, probability } = req.body;

    const reward = await Rewards.find({ active: true });

    if(reward.length > 0) {
        const probabilitySystem = reward.reduce((acc, cur) => acc + cur.probability, 0);

        if((1 - probabilitySystem) < probability) {
            return next(new AppError('Xác suất phần thưởng vượt quá giới hạn cho phép', 400));
        }
    }

    const dataCreate = {
        name,
        type,
        probability
    };

    if(type === 'point') {
        dataCreate.value = value;
    }else if (type === 'voucher') {
        dataCreate.voucherId = voucherId;
    }

    const newReward = await Rewards.create(dataCreate);

    res.status(201).json({
        status: 'success',
        data: {
            reward: newReward
        }
    });
});

exports.getAllRewards = catchAsync(async (req, res, next) => {
    const rewards = new APIFeatures(Rewards, req.query)
        .filter()
        .search()
        .sort()
        .limitFields();

    const rewardsList = await rewards.query.populate('voucherId');
    const totalProbability = rewardsList.reduce((sum, r) => sum + r.probability, 0);


    res.status(200).json({
        status: 'success',
        totalDocs: rewardsList.length,
        totalProbability,
        data: {
            rewards: rewardsList
        }
    });
});

exports.getRewardById = Factory.getOne(Rewards);

exports.updateReward = catchAsync(async (req, res, next) => {
    const { name, type, value, voucherId, probability, active } = req.body;

    const reward = await Rewards.find({ active: true });

    if(reward.length > 0) {
        const probabilitySystem = reward.reduce((acc, cur) => acc + cur.probability, 0);

        if((1 - probabilitySystem) < probability) {
            return next(new AppError('Xác suất phần thưởng vượt quá giới hạn cho phép', 400));
        }
    }

    const dataUpdate = {
        name,
        type,
        probability,
        active
    };

    if(type === 'point') {
        dataUpdate.value = value;
    }else if (type === 'voucher'){
        dataUpdate.voucherId = voucherId;
    }

    const updatedReward = await Rewards.findByIdAndUpdate(req.params.id, dataUpdate, {
        new: true,
        runValidators: true
    });

    res.status(201).json({
        status: 'success',
        data: {
            reward: updatedReward
        }
    });
});

exports.spinReward = catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const user = await User.findById(req.user._id).select('+totalEarnedPoints').populate('level').session(session);

        if(!user) {
            return next(new AppError('Người dùng không tồn tại', 404));
        }

        if(user.spinCount <= 0) {
            return next(new AppError('Bạn không còn lượt quay nào', 400));
        }

        const reward = await Rewards.findOne({ _id: id, active: true }).populate({ path: 'voucherId', options: { session } }).session(session);

        if(!reward) {
            return next(new AppError('Không có phần thưởng nào khả dụng', 404));
        }

        if( reward.type === 'point') {
            user.memberShipPoints += reward.value;
            user.totalEarnedPoints += reward.value;

            const level = await Level.find(
                {
                    active: true,
                },
                null,
                { session }
            ).sort({ pointMultiplier: -1 });

            const nextLevel = level.find(l => l.minXp <= user.totalEarnedPoints);

            if (nextLevel && user.level._id.toString() !== nextLevel._id.toString()) {
                const currentLevel = user.level.name;
                user.level = nextLevel._id;

                if (nextLevel.voucherId) {
                    await VoucherUse.findOneAndUpdate(
                        { userId: user._id, voucherId: nextLevel.voucherId },
                        { $inc: { usageLimit: 1 } },
                        { new: true, upsert: true }
                    ).session(session);
                }

                const voucher = nextLevel.voucherId ? await Voucher.findById(nextLevel.voucherId).session(session) : null;

                const emailContent = {
                    userName: user.name,
                    currentLevel: currentLevel,
                    nextLevel: nextLevel.name,
                    icon: nextLevel.icon,
                    voucherCode: voucher ? voucher.voucherCode : 'Không có voucher',
                    voucherName: voucher ? voucher.voucherName : 'Không có voucher',
                    discountValue: voucher ? voucher.discountValue : 'Không có voucher',
                    imageUrl: voucher ? voucher.imageUrl : '',
                };

                // Gửi email thông báo nâng cấp cấp độ
                await new Email(user, emailContent).sendNextLevel()
            }
        } else if (reward.type === 'voucher') {
            await VoucherUse.findOneAndUpdate(
                { userId: user._id, voucherId: reward.voucherId._id },
                { $inc: { usageLimit: 1 } },
                { new: true, upsert: true }
            ).session(session);
        }

        // Giảm lượt quay của người dùng
        user.spinCount -= 1;
        await user.save({ session });

        await session.commitTransaction();

        res.status(200).json({
            status: 'success',
            data: {
                reward: reward
            }
        })
    }catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
});