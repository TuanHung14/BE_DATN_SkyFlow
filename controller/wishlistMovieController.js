const catchAsync = require('../utils/catchAsync');
const WishlistMovie = require('../model/wishlistMovieModel');
const Movie = require('../model/movieModel');
const AppError = require("../utils/appError");

exports.toggeleWishlistMovie = catchAsync(async (req, res, next) => {
    const { movieId } = req.params;
    const userId = req.user._id;

    const movie = await Movie.findOne({
        _id: movieId,
        isDeleted: false,
        publishStatus: 'PUBLISHED',
    });

    if (!movie) {
        return next(new AppError('Phim không tìm thấy hoặc không có sẵn', 404));
    }

    const existingWishlistMovie = await WishlistMovie.findOne({
        userId,
        movieId,
    });

    if (existingWishlistMovie) {
        // Nếu đã có trong danh sách yêu thích, xóa khỏi danh sách
        await WishlistMovie.deleteOne({ _id: existingWishlistMovie._id });
        return res.status(200).json({
            status: 'success',
            message: 'Đã xóa phim khỏi danh sách yêu thích',
        });
    } else {
        // Nếu chưa có trong danh sách yêu thích, thêm vào
        const newWishlistMovie = await WishlistMovie.create({
            userId,
            movieId,
        });
        return res.status(201).json({
            status: 'success',
            message: 'Phim đã được thêm vào danh sách yêu thích',
        });
    }
})

exports.getWishlistMovies = catchAsync(async (req, res, next) => {
    const userId = req.user._id;

    const movies = await WishlistMovie.find({ userId }, { movieId: 1 }, { $sort: { createdAt: -1 } })
        .populate({
            path: 'movieId',
            match: { publishStatus: "PUBLISHED" },
            select: 'name ratingsAverage status posterUrl trailerUrl slug',
        });

    res.status(200).json({
        status: 'success',
        data: {
            movies,
        },
    });
})