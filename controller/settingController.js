const Setting = require("../model/settingModel"); // Sửa: 'model' -> 'models'
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const settingService = require("../services/settingService");

// Giới hạn field được update
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

/**
 * Lấy tất cả settings (dùng Factory)
 */
exports.getAllSettings = Factory.getAll(Setting);

/**
 * Lấy setting theo ID
 */

exports.getSettingById = catchAsync(async (req, res, next) => {
  const setting = await settingService.getSettingById(req.params.id);

  if (!setting) {
    return next(new AppError("Không tìm thấy setting", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      setting,
    },
  });
});

/**
 * Tạo mới setting
 */
exports.createSetting = catchAsync(async (req, res, next) => {
  const setting = await settingService.createSetting(req.body);
  res.status(201).json({
    status: "success",
    data: {
      setting,
    },
  });
});

/**
 * Cập nhật setting
 */
exports.updateSetting = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    "company_name",
    "address",
    "contact_email",
    "phone_number",
    "logo_url"
  );

  const updatedSetting = await settingService.updateSetting(
    req.params.id,
    filteredBody
  );

  if (!updatedSetting) {
    return next(new AppError("Không tìm thấy setting để cập nhật", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      setting: updatedSetting,
    },
  });
});

/**
 * Xóa setting
 */

exports.deleteSetting = catchAsync(async (req, res, next) => {
  const deleted = await settingService.deleteSetting(req.params.id);

  if (!deleted) {
    return next(new AppError("Không tìm thấy setting để xóa", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
