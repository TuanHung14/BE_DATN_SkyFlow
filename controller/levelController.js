const Factory = require('./handleFactory');
const Level = require('../model/levelModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getFieldGetClient = (req, res, next) => {
    req.query.active = true;
    next();
}

exports.toggleIsDefault = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const level = await Level.findById(id);

    if (!level) {
         return next(new AppError('Cấp độ không tồn tại!'), 404);
    }

    if (level.isDefault) {
         return next(new AppError('Ít nhất một cấp độ phải được đánh dấu là mặc định!'), 400);
    }

    level.isDefault = !level.isDefault;
    level.active = true;

    await level.save();

    await Level.updateMany(
        { _id: { $ne: id } },
        { $set: { isDefault: false } }
    );

    res.status(200).json({
        status: 'success',
        data: {
            level
        }
    });
});

exports.createLevel = Factory.createOne(Level);

exports.getAllLevels = Factory.getAll(Level);

exports.getLevelById = Factory.getOne(Level);

exports.updateLevel = Factory.updateOne(Level);