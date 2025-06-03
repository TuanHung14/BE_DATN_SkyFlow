const Voucher = require("../model/voucherModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Factory = require("./handleFactory");

exports.createVoucher = Factory.createOne(Voucher);

exports.getAllVouchers = Factory.getAll(Voucher);

exports.getVoucher = Factory.getOne(Voucher);

exports.updateVoucher = Factory.updateOne(Voucher);

exports.deleteVoucher = Factory.softDeleteOne(Voucher);