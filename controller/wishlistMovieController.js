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

    const movies = await WishlistMovie.aggregate([
        {
            $match: { userId }
        },
        {
            $lookup: {
                from: "movies", // collection movies
                localField: "movieId",
                foreignField: "_id",
                as: "movie"
            }
        },
        { $unwind: "$movie" }, // tách thành object
        {
            $match: { "movie.publishStatus": "PUBLISHED" } // lọc phim active
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $project: {
                _id: 1,
                movieId: "$movie._id",
                name: "$movie.name",
                ratingsAverage: "$movie.ratingsAverage",
                status: "$movie.status",
                posterUrl: "$movie.posterUrl",
                trailerUrl: "$movie.trailerUrl",
                slug: "$movie.slug"
            }
        }
    ]);


    res.status(200).json({
        status: 'success',
        data: {
            movies,
        },
    });
})