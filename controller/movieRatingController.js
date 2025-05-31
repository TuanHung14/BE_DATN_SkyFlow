const movieRating = require('../model/movieRatingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handleFactory');


exports.createMovieRating = catchAsync(async (req, res, next) => {
    if (req.params.id) {
        req.body.movieId = req.params.id;
    }

    if (req.user) {
        req.body.userId = req.user._id;
    }

    const existingRating = await movieRating.findOne({
        userId: req.body.userId,
        movieId: req.body.movieId
    });

    if (existingRating) {
        return next(new AppError("Bạn đã đánh giá phim này rồi", 400))
    }

    const newRating = await movieRating.create(req.body);

    const populatedRating = await movieRating.findById(newRating._id)
        .populate({
            path: 'userId'
        })
        .populate({
            path: 'movieId'
        });

    res.status(201).json({
        status: 'success',
        data: {
            rating: populatedRating
        }
    });

})

exports.getAllRatings = catchAsync(async (req, res, next) => {
    let filter = {};

    if (req.params.id) {
        filter.movieId = req.params.id;
    }

    const ratings = await movieRating.find(filter).populate({
        path: "userId"
    }).populate({
        path: "movieId"
    })

    res.status(200).json({
        status: "success",
        results: ratings.length,
        data: {
            ratings
        }
    })
});

