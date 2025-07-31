const Factory = require('./handleFactory')
const Rewards = require('../model/rewardsModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

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
    }else{
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

exports.getAllRewards = Factory.getAll(Rewards);

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
    }else{
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