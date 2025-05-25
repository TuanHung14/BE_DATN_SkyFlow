const movieRating = require('../model/movieRatingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handleFactory');


exports.getAllRatings = Factory.getAll(movieRating);

exports.getAllRatingByUserId = catchAsync(async (req, res, next) => {
    const { userId } = req.params;

    const ratings = await movieRating.find({ userId })
        .populate({
            path: 'movieId'
        });
    res.status(200).json({
        status: 'success',
        results: ratings.length,
        data: {
            ratings
        }
    });
});

exports.getMovieRatingById = Factory.getOne(movieRating);

exports.createMovieRating = Factory.createOne(movieRating);