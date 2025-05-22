const Movie = require("../model/movieModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Factory = require("./handleFactory");
const { filterObj } = require("../utils/helper");

// CREATE MOVIE
exports.createMovie = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  // Check trùng tên phim
  const existingMovie = await Movie.findOne({ name });
  if (existingMovie) {
    return next(
      new AppError("Tên phim đã tồn tại. Vui lòng chọn tên khác", 400)
    );
  }

  // Chỉ cho phép các trường được tạo
  const allowedFields = [
    "name",
    "nation",
    "releaseDate",
    "duration",
    "description",
    "age",
    "posterUrl",
    "trailerUrl",
    "directorId",
    "genresId",
    "castId",
  ];
  const data = filterObj(req.body, ...allowedFields);

  // Tạo phim
  const newMovie = await Movie.create(data);

  res.status(201).json({
    status: "success",
    data: {
      data: newMovie,
    },
  });
});
// UPDATE MOVIE
exports.updateMovie = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Chỉ cho phép các field này được cập nhật
  const allowedFields = [
    "name",
    "nation",
    "releaseDate",
    "duration",
    "description",
    "age",
    "posterUrl",
    "trailerUrl",
    "directorId",
    "genresId",
    "castId",
    "publishStatus",
  ];
  const data = filterObj(req.body, ...allowedFields);

  const movie = await Movie.findById(id);
  if (!movie) {
    return next(new AppError("Không tìm thấy phim", 404));
  }

  // Kiểm tra trùng tên nếu có cập nhật name
  if (data.name && data.name !== movie.name) {
    const duplicate = await Movie.findOne({
      name: data.name,
      _id: { $ne: id },
    });
    if (duplicate) {
      return next(
        new AppError("Tên phim đã tồn tại. Vui lòng chọn tên khác", 400)
      );
    }
  }

  // Cập nhật và lưu
  Object.assign(movie, data);
  await movie.save();

  res.status(200).json({
    status: "success",
    data: { data: movie },
  });
});
exports.getMovieBySlug = catchAsync(async (req, res, next) => {
  const movie = await Movie.findOne({
    slug: req.params.slug,
    isDeleted: false,
    publishStatus: { $ne: "DRAFT" },
  });

  if (!movie) {
    return next({
      statusCode: 404,
      message: "Không tìm thấy phim với slug này",
    });
  }

  res.status(200).json({
    status: "success",
    data: movie,
  });
});
exports.getAllMovies = (req, res, next) => {
  req.query.publishStatus = "PUBLISHED";
  return Factory.getAll(Movie, "castId genresId directorId")(req, res, next);
};
exports.getAllMoviesAdmin = Factory.getAll(Movie, "castId genresId directorId");
exports.getMovie = Factory.getOne(Movie, "castId genresId directorId");

// SOFT DELETE
exports.softDeleteMovie = Factory.softDeleteOne(Movie);
