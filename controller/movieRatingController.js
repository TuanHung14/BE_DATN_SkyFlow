const MovieRating = require('../model/movieRatingModel');
const catchAsync = require('../utils/catchAsync');


exports.createMovieRating = catchAsync(async (req, res, next) => {
    const { rating, ticketId } = req.body;

    const newRating = await MovieRating.create({
        movieId: req.params.movieId,
        userId: req.user._id,
        ticketId,
        rating,
    });

    res.status(201).json({
        status: 'success',
        data: newRating,
    });
});

