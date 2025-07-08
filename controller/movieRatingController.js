const MovieRating = require('../model/movieRatingModel');
const catchAsync = require('../utils/catchAsync');


exports.createMovieRating = catchAsync(async (req, res, next) => {
    const { rating } = req.body;

    const newRating = await MovieRating.create({
        movieId: req.params.movieId,
        userId: req.user._id,
        rating,
    });

    res.status(201).json({
        status: 'success',
        data: newRating,
    });
});

