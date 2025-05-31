const showTimeModel = require("../model/showtimeModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Factory = require("./handleFactory");
const showTimeService = require("../services/showTimeService");
const movieModel = require("../model/movieModel");
const mongoose = require('mongoose');

const validateStartTime = (startTime, next) => {
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();

    const startTimeInMinutes = startHour * 60 + startMinute;
    const earliestAllowed = 8 * 60 + 30;
    const latestAllowed = 23 * 60;

    if (startTimeInMinutes < earliestAllowed || startTimeInMinutes > latestAllowed) {
        return next(new AppError('Thời gian bắt đầu phải từ 8:30 đến 23:00', 400));
    }

    return true;
};

const calculateEndTime = async (movieId, startTime, next) => {
    const movie = await movieModel.findById(movieId);
    if (!movie) {
        return next(new AppError('Không tìm thấy thông tin phim', 404));
    }
    const movieDuration = movie.duration;
    const endTime = new Date(startTime);
    // thời gian kết thúc của một bộ phim cộng với thời gian để dọn dẹp,
    // cũng như để khách đợt sau có thời gian vào là 10 phút
    endTime.setMinutes(endTime.getMinutes() + movieDuration + 10);

    return { endTime, movie };
}

const checkConflictingShowtimes = async (roomId, startTime, endTime, showTimeId = null) => {
    const conflicQuery = {
        roomId: roomId,
        isDeleted: false,
        $or: [
            {
                startTime: { $lt: endTime },
                endTime: { $gt: startTime }
            }
        ]
    };

    if (showTimeId) {
        conflicQuery._id = { $ne: showTimeId};
    }

    return await showTimeModel.findOne(conflicQuery);
}

exports.getShowTimeFilter = catchAsync(async (req, res, next) => {
    const { date, province, cinemaId } = req.query;

    if (date && isNaN(new Date(date).getTime())) {
        return next(new AppError('Ngày không hợp lệ', 400));
    }

    if (cinemaId && !mongoose.isValidObjectId(cinemaId)) {
        return next(new AppError('Cinema ID không hợp lệ', 400));
    }

    const showtimes = await showTimeService.getShowtimes({date, province, cinemaId});

    res.status(200).json({
        status: 'success',
        results: showtimes.length,
        data: {
            data: showtimes
        }
    });
});

exports.createShowTime = catchAsync(async (req, res, next) => {
    const startTime = new Date(req.body.startTime);

    validateStartTime(startTime, next);

    const { endTime } = await calculateEndTime(req.body.movieId, startTime, next);
    req.body.endTime = endTime;

    const conflictShowTime = await checkConflictingShowtimes(req.body.roomId, startTime, endTime);
    if (conflictShowTime) {
        return next(new AppError('Đã có suất chiếu khác trong thời gian này', 409));
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
        validateStartTime(startTime, next);

        const showtime = await showTimeModel.findById(req.params.id);
        if (!showtime) {
            return next(new AppError('Không tìm thấy suất chiếu', 404));
        }

        const movieId = req.body.movieId || showtime.movieId;
        const roomId = req.body.roomId || showtime.roomId;

        const { endTime } = await calculateEndTime(movieId, startTime, next);
        req.body.endTime = endTime;

        const conflicShowTime = await checkConflictingShowtimes(roomId, startTime, endTime, req.params.id);
        if (conflicShowTime) {
            return next(new AppError('Đã có suất chiếu khác trong thời gian này', 409));
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

exports.getAllShowTime = catchAsync(async (req, res, next) => {
    const result = await showTimeService.getAllShowTimes(req.query);

    if (result) {
        res.status(200).json({
            status: 'success',
            results: result.totalResults,
            data: {
                data: result
            }
        });
    } else {
        return next(new AppError(`Không có suất chiếu nào!`, 404));
    }

})
exports.getOneShowTimeById = Factory.getOne(showTimeModel, 'movieId roomId formatId');
exports.deleteShowTime = Factory.softDeleteOne(showTimeModel);