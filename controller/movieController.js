const Movie = require("../model/movieModel");
const Ticket = require("../model/ticketModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Factory = require("./handleFactory");
const {filterObj} = require("../utils/helper");
const {updateMovieStatusLogic} = require("../services/movieService");

// CREATE MOVIE
exports.createMovie = catchAsync(async (req, res, next) => {
    const {name} = req.body;

    // Check trùng tên phim
    const existingMovie = await Movie.findOne({name});
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
        "imageLandscape",
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
    const {id} = req.params;

    // Chỉ cho phép các field này được cập nhật
    const allowedFields = [
        "name",
        "nation",
        "releaseDate",
        "duration",
        "description",
        "age",
        "posterUrl",
        "imageLandscape",
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
            _id: {$ne: id},
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
        data: {data: movie},
    });
});

exports.getMovieBySlug = catchAsync(async (req, res, next) => {
    const movie = await Movie.findOne({
        slug: req.params.slug,
        isDeleted: false,
        publishStatus: {$ne: "DRAFT"},
    }).populate("castId genresId directorId");

    if (!movie) {
        return next({
            statusCode: 404,
            message: "Không tìm thấy phim với slug này",
        });
    }

    res.status(200).json({
        status: "success",
        data: movie,
    });
});

exports.getMovieRecommend = catchAsync(async (req, res, next) => {
    const userId = req.user._id;

    const movies = await Ticket.aggregate([
        {
            $match: {
                userId: userId,
                paymentStatus: "Paid"
            }
        },
        // Bước 2: Lookup để lấy movie_id qua showtime
        {
            $lookup: {
                from: "showtimes",
                localField: "showtimeId",
                foreignField: "_id",
                as: "showtime"
            }
        },
        { $unwind: "$showtime" },

        // Bước 3: Lookup để lấy genres_id từ movies
        {
            $lookup: {
                from: "movies",
                localField: "showtime.movieId",
                foreignField: "_id",
                as: "movie"
            }
        },
        { $unwind: "$movie" },

        // Bước 4: Lấy các genres_id
        {
            $project: {
                genresId: "$movie.genresId"
            }
        },
        { $unwind: "$genresId" },

        // Bước 5: Đếm số lần xem mỗi thể loại (nếu cần)
        {
            $group: {
                _id: "$genresId",
                count: { $sum: 1 }
            }
        },

        // Bước 6: Sắp xếp thể loại nhiều lượt xem nhất
        { $sort: { count: -1 } },

        // Bước 7: Lấy 1-2 thể loại xem nhiều nhất
        { $limit: 2 },
    ]);

    if (movies.length === 0) {
        return next(new AppError("Không tìm thấy thể loại nào", 404));
    }

    const genresIds = movies.map(item => item._id);

    const recommendedMovies = await Movie.find({
        genresId: { $in: genresIds },
        isDeleted: false,
        publishStatus: "PUBLISHED"
    }).populate("castId genresId directorId").limit(4);

    if (recommendedMovies.length === 0) {
        return next(new AppError("Không tìm thấy phim nào phù hợp", 404));
    }

    res.status(200).json({
        status: "success",
        data: recommendedMovies,
    });
});

exports.getAllMovies = (req, res, next) => {
    req.query.publishStatus = "PUBLISHED";
    return Factory.getAll(Movie, "castId genresId directorId")(req, res, next);
};

exports.getAllMoviesAdmin = Factory.getAll(Movie, "castId genresId directorId");

exports.getMovie = Factory.getOne(Movie, "castId genresId directorId");

// SOFT DELETE
exports.softDeleteMovie = Factory.softDeleteOne(Movie);

exports.updateMovieStatusHandler = catchAsync(async (req, res, next) => {
    const count = await updateMovieStatusLogic();

    res.status(200).json({
        status: "success",
        message: `Cập nhật ${count} phim`,
    });
});
