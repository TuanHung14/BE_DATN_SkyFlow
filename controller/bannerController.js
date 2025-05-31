const Factory = require("./handleFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Banner = require("../model/bannerModel");

exports.getAllBanners = Factory.getAll(Banner);
exports.getBannerById = Factory.getOne(Banner);
exports.createBanner = Factory.createOne(Banner);
exports.updateBanner = Factory.updateOne(Banner);
exports.deleteBanner = Factory.softDeleteOne(Banner);
