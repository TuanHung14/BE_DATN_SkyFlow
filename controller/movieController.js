const Movie = require("../model/movieModel");
const factory = require("./handleFactory");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const movieService = require("../services/movieService");

exports.createMovie = catchAsync(async (req, res, next) => {
  const newMovie = await movieService.createMovie(req.body);

  res.status(201).json({
    status: "success",
    data: {
      data: newMovie,
    },
  });
});
exports.updateMovie = catchAsync(async (req, res, next) => {
  // Không cho phép cập nhật các trường đánh giá
  delete req.body.ratings_average;
  delete req.body.ratings_quantity;

  const updatedMovie = await movieService.updateMovie(req.params.id, req.body);

  res.status(200).json({
    status: "success",
    data: {
      data: updatedMovie,
    },
  });
});

exports.getAllMovies = factory.getAll(Movie, "castId genresId directorId");
exports.getMovie = factory.getOne(Movie, "castId genresId directorId");
exports.softDeleteMovie = factory.softDeleteOne(Movie);
