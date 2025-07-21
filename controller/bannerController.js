const Factory = require("./handleFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Banner = require("../model/bannerModel");

exports.getAllBannersAdmin = Factory.getAll(Banner);
exports.getAllBannersClient = (req, res, next) => {
  req.query = {
    ...req.query,
    status: "active",
    ...(req.query.search ? { search: { title: req.query.search } } : {}),
  };

  Factory.getAll(Banner)(req, res, next);
};

exports.getBannerById = Factory.getOne(Banner);
exports.createBanner = Factory.createOne(Banner);
exports.updateBanner = Factory.updateOne(Banner);
exports.deleteBanner = Factory.deleteOne(Banner);
exports.changeBannerStatus = catchAsync(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    return next(new AppError("Không tìm thấy banner với ID này", 404));
  }

  // Chuyển đổi trạng thái
  banner.status = banner.status === "active" ? "inActive" : "active";
  await banner.save();

  res.status(200).json({
    status: "success",
    data: {
      banner,
    },
  });
});
