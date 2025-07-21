const Setting = require("../model/settingModel"); // Sửa: 'model' -> 'models'
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const Factory = require("./handleFactory");
// Giới hạn field được update

/**
 * Lấy tất cả settings (dùng Factory)
 */
exports.getAllSettings = Factory.getAll(Setting);

/**
 * Lấy setting theo ID
 */

exports.getSettingById = Factory.getOne(Setting);

/**
 * Tạo mới setting
 */
exports.createSetting = Factory.createOne(Setting);

/**
 * Cập nhật setting
 */
exports.updateSetting = Factory.updateOne(Setting);

/**
 * Xóa setting
 */

exports.deleteSetting = Factory.deleteOne(Setting);
// controllers/settingController.js
exports.setDefault = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Kiểm tra setting có tồn tại không
  const setting = await Setting.findById(id);
  if (!setting) {
    return next(new AppError("Không tìm thấy setting với ID đã cho", 404));
  }

  // Bỏ đánh dấu mặc định với tất cả setting khác
  await Setting.updateMany({ _id: { $ne: id } }, { isDefault: false });

  // Cập nhật setting được chọn là mặc định
  setting.isDefault = true;
  await setting.save();

  res.status(200).json({
    status: "success",
    message: "Đã đặt setting mặc định",
    data: {
      setting,
    },
  });
});
