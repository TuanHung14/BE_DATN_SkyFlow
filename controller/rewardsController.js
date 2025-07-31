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

    const totalProbability = await rewards.query.clone().reduce((sum, r) => sum + r.probability, 0);

    const rewardsList = await rewards.query;

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
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const user = await User.findById(req.user._id).populate('level').session(session);

        if(!user) {
            return next(new AppError('Người dùng không tồn tại', 404));
        }

        if(user.spinCount <= 0) {
            return next(new AppError('Bạn không còn lượt quay nào', 400));
        }

        const rewards = await Rewards.find({ active: true }).populate('voucherId').session(session);

        if(rewards.length === 0) {
            return next(new AppError('Không có phần thưởng nào khả dụng', 404));
        }

        const totalProbability = rewards.reduce((sum, r) => sum + r.probability, 0);
        if (totalProbability < 1) {
            return next(new AppError('Phần thưởng chưa đủ điều kiện để chơi. Vui lòng đợi hệ thống cập nhập lại!', 400));
        }

        const randomValue = Math.random();
        let cumulativeProbability = 0;
        let selectedReward = null;

        rewards.sort(() => Math.random() - 0.5);

        for (const reward of rewards) {
            cumulativeProbability += reward.probability;
            if (randomValue <= cumulativeProbability) {
                selectedReward = reward;
                break;
            }
        }

        if (!selectedReward) {
            return next(new AppError('Vòng quay đang bị lỗi vui lòng thử lại sau', 500));
        }

        if( selectedReward.type === 'point') {
            user.memberShipPoints += selectedReward.value;
            user.totalEarnedPoints += selectedReward.value;

            const level = await Level.find(
                {
                    active: true,
                },
                null,
                { session }
            ).sort({ pointMultiplier: -1 });

            const nextLevel = level.find(l => l.minXp <= user.totalEarnedPoints);

            if (nextLevel && user.level._id.toString() !== nextLevel._id.toString()) {
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
                    currentLevel: user.level.name,
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
        } else if (selectedReward.type === 'voucher') {
            await VoucherUse.findOneAndUpdate(
                { userId: user._id, voucherId: selectedReward.voucherId._id },
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
                reward: selectedReward
            }
        })
    }catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
});