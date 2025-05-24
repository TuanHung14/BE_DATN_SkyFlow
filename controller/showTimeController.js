const showTimeModel = require("../model/showtimeModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Factory = require("./handleFactory");
const mongoose = require("mongoose");
const showTimeService = require("../services/showTimeService");

exports.getShowTimeFilter = catchAsync(async (req, res, next) => {
    const { date, province, cinemaId } = req.params;

    if (date && isNaN(new Date(date).getTime())) {
        return next(new AppError('Ngày không hợp lệ', 400));
    }

    const showtimes = await showTimeService.getShowtimes({date, province, cinemaId});

    res.status(200).json({
        status: 'success',
        results: Array.isArray(showtimes) ? showtimes.length : 0,
        data: {
            data: showtimes
        }
    });
});

// ========== Flow 1: Cinema -> Dates -> Showtimes ==========
// API 1: Lấy danh sách ngày có suất chiếu theo rạp
exports.getAvailableDates = catchAsync(async (req, res, next) => {
    const { cinemaId } = req.params;

    if (!cinemaId) {
        return next(new AppError('Cinema ID is required', 400));
    }

    const dates = await showTimeService.getAvailableDates(cinemaId);

    res.status(200).json({
        status: 'success',
        results: dates.length,
        data: {
            dates
        }
    });
});

// API 2: Lấy danh sách suất chiếu theo rạp và ngày
exports.getShowtimesByDateAndCinema = catchAsync(async (req, res, next) => {
    const { cinemaId, date } = req.params;

    if (!cinemaId || !date) {
        return next(new AppError('Both cinema ID and date are required', 400));
    }

    if (isNaN(new Date(date).getTime())) {
        return next(new AppError('Invalid date format. Please use YYYY-MM-DD', 400));
    }

    const showtimes = await showTimeService.getShowtimesByDateAndCinema(cinemaId, date);

    res.status(200).json({
        status: 'success',
        results: showtimes.length,
        data: {
            showtimes
        }
    });
});

// ========== Flow 2: Movie -> Province -> Cinema -> Date -> Showtimes ==========
// API 3: Lấy danh sách tỉnh/thành phố có chiếu phim cụ thể
exports.getProvincesByMovie = catchAsync(async (req, res, next) => {
    const { movieId } = req.params;

    if (!movieId) {
        return next(new AppError('Movie ID is required', 400));
    }

    const provinces = await showTimeService.getProvincesByMovie(movieId);

    res.status(200).json({
        status: 'success',
        results: provinces.length,
        data: {
            provinces
        }
    });
});

// API 4: Lấy danh sách rạp theo phim và tỉnh/thành phố
exports.getCinemasByMovieAndProvince = catchAsync(async (req, res, next) => {
    const { movieId, province } = req.params;

    if (!movieId || !province) {
        return next(new AppError('Movie ID and province are required', 400));
    }

    const cinemas = await showTimeService.getCinemasByMovieAndProvince(movieId, province);

    res.status(200).json({
        status: 'success',
        results: cinemas.length,
        data: {
            cinemas
        }
    });
});

// API 5: Lấy danh sách ngày có suất chiếu theo phim và rạp
exports.getDatesByMovieAndCinema = catchAsync(async (req, res, next) => {
    const { movieId, cinemaId } = req.params;

    if (!movieId || !cinemaId) {
        return next(new AppError('Movie ID and cinema ID are required', 400));
    }

    const dates = await showTimeService.getDatesByMovieAndCinema(movieId, cinemaId);

    res.status(200).json({
        status: 'success',
        results: dates.length,
        data: {
            dates
        }
    });
});

// API 6: Lấy danh sách suất chiếu theo phim, rạp và ngày
exports.getShowtimesByMovieCinemaAndDate = catchAsync(async (req, res, next) => {
    const { movieId, cinemaId, date } = req.params;

    if (!movieId || !cinemaId || !date) {
        return next(new AppError('Movie ID, cinema ID and date are required', 400));
    }

    if (isNaN(new Date(date).getTime())) {
        return next(new AppError('Invalid date format. Please use YYYY-MM-DD', 400));
    }

    const showtimes = await showTimeService.getShowtimesByMovieCinemaAndDate(movieId, cinemaId, date);

    res.status(200).json({
        status: 'success',
        results: showtimes.length,
        data: {
            showtimes
        }
    });
});


exports.createShowTime = catchAsync(async (req, res, next) => {
    const startTime = new Date(req.body.startTime);
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();

    const startTimeInMinutes = startHour * 60 + startMinute;
    const earliestAllowed = 8 * 60 + 30;
    const latestAllowed = 23 * 60;

    if (startTimeInMinutes < earliestAllowed || startTimeInMinutes > latestAllowed) {
        return next(new AppError('Thời gian bắt đầu phải từ 8:30 đến 23:00', 400));
    }

    const Movie = mongoose.model('Movie');
    const movie = await Movie.findById(req.body.movieId);
    if (!movie) {
        return next(new AppError('Không tìm thấy thông tin phim', 404));
    }

    const movieDuration = movie.duration;

    const endTime = new Date(startTime);
    // thời gian kết thúc của một bộ phim cộng với thời gian để dọn dẹp,
    // cũng như để khách đợt sau có thời gian vào là 10 phút
    endTime.setMinutes(endTime.getMinutes() + movieDuration + 10);

    req.body.endTime = endTime;

    const conflictShowtime = await showTimeModel.findOne({
        roomId: req.body.roomId,
        isDeleted: false,
        $or: [
            {
                // Lịch chiếu mới bắt đầu trong khoảng thời gian của lịch chiếu đã có
                startTime: { $lt: endTime },
                endTime: { $gt: startTime }
            }
        ]
    });

    if (conflictShowtime) {
        return next(new AppError('Đã có suất chiếu khác trong khoảng thời gian này', 409));
    }

    const doc = await showTimeModel.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});

exports.updateShowTime = catchAsync(async (req, res, next) => {
    if (req.body.startTime) {
        const startTime = new Date(req.body.startTime);
        const startHour = startTime.getHours();
        const startMinute = startTime.getMinutes();

        const startTimeInMinutes = startHour * 60 + startMinute;
        const earliestAllowed = 8 * 60 + 30;
        const latestAllowed = 23 * 60;

        if (startTimeInMinutes < earliestAllowed || startTimeInMinutes > latestAllowed) {
            return next(new AppError('Thời gian bắt đầu phải từ 8:30 đến 23:00', 400));
        }

        const showtime = await showTimeModel.findById(req.params.id);
        if (!showtime) {
            return next(new AppError('Không tìm thấy suất chiếu', 404));
        }

        const movieId = req.body.movieId || showtime.movieId;
        const roomId = req.body.roomId || showtime.roomId;

        const Movie = mongoose.model('Movie');
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return next(new AppError('Không tìm thấy thông tin phim', 404));
        }

        const movieDuration = movie.duration;

        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + movieDuration + 10);
        req.body.endTime = endTime;

        const conflictShowtime = await showTimeModel.findOne({
            roomId: roomId,
            _id: { $ne: req.params.id },
            isDeleted: false,
            $or: [
                // Lịch chiếu mới bắt đầu trong khoảng thời gian của lịch chiếu đã có
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        });

        if (conflictShowtime) {
            return next(new AppError('Đã có suất chiếu khác trong khoảng thời gian này', 409));
        }
    }

    const doc = await showTimeModel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!doc) {
        return next(new AppError('Không tìm thấy suất chiếu với ID này', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});

exports.getAllShowTime = Factory.getAll(showTimeModel, 'movieId roomId formatId');
exports.getOneShowTimeById = Factory.getOne(showTimeModel, 'movieId roomId formatId');
exports.deleteShowTime = Factory.softDeleteOne(showTimeModel);