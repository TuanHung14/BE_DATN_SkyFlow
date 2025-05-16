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
