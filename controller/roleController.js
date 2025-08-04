const Role = require("../model/roleModel");
const Factory = require("./handleFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.toggleIsDefault = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const role = await Role.findById(id);

    if (!role) {
        return next(new AppError('Vai trò không tồn tại!'), 404);
    }

    if (role.isDefault) {
        return next(new AppError('Ít nhất một vai trò phải được đánh dấu là mặc định!'), 400);
    }

    role.isDefault = !role.isDefault;
    role.isActive = true;

    await role.save();

    await Role.updateMany(
        { _id: { $ne: id } },
        { $set: { isDefault: false } }
    );

    res.status(200).json({
        status: 'success',
        data: {
            role
        }
    });
});

exports.createRole = Factory.createOne(Role);
exports.updateRole = Factory.updateOne(Role);
exports.findAllRole = Factory.getAll(Role);
exports.findOneRole = Factory.getOne(Role);