const MovieRating = require('../model/movieRatingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');


exports.createMovieRating = catchAsync(async (req, res, next) => {
    const { rating } = req.body;

    let movieId = req.body.movieId;
    if (req.params.movieId) {
        movieId = req.params.movieId;
    }

    const existingRating = await MovieRating.findOne({ userId: req.user._id, movieId });
    if (existingRating) {
        return next(new AppError('Bạn đã đánh giá bộ phim này rồi!', 400));
    }

    const newRating = await MovieRating.create({
        movieId,
        userId: req.user._id,
        rating,
    });

    const populatedRating = await MovieRating.findById(newRating._id)
        .populate({
            path: 'userId',
            select: 'name email',
        })
        .populate({
            path: 'movieId',
            select: 'name slug',
        });

    res.status(201).json({
        status: 'success',
        data: {
            rating: populatedRating,
        },
    });
});

