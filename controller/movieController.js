const Movie = require("../model/movieModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const slugify = require("slugify");
const factory = require("./handleFactory");
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
exports.getMovieBySlug = async (req, res, next) => {
  try {
    const movie = await Movie.findOne({ slug: req.params.slug });

    if (!movie) {
      return res.status(404).json({
        status: "fail",
        message: "Không tìm thấy phim với slug này",
      });
    }

    res.status(200).json({
      status: "success",
      data: movie,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Lỗi máy chủ",
    });
  }
};
exports.getAllMovies = (req, res, next) => {
  if (req.user?.role !== "admin") {
    req.filter = { publishStatus: "PUBLISHED" };
  }
  return factory.getAll(Movie, "castId genresId directorId")(req, res, next);
};

// GET ONE
exports.getMovie = factory.getOne(Movie, "castId genresId directorId");

// SOFT DELETE
exports.softDeleteMovie = factory.softDeleteOne(Movie);
