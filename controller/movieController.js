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
  const updatedMovie = await movieService.updateMovie(req.params.id, req.body);

  res.status(200).json({
    status: "success",
    data: {
      data: updatedMovie,
    },
  });
});

exports.getAllMovies = factory.getAll(Movie);
exports.getMovie = factory.getOne(Movie);
exports.deleteMovie = factory.deleteOne(Movie);
exports.softDeleteMovie = factory.softDeleteOne(Movie);
