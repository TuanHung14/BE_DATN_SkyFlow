const showTimeModel = require("../model/showtimeModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Factory = require("./handleFactory");
const movieModel = require("../model/movieModel");
const mongoose = require('mongoose');

const normalizeToMidnight = (date) => {
    const normalized = new Date(date);
    normalized.setUTCHours(0, 0, 0, 0);
    return normalized;
};

const validateStartTime = (startTime, next) => {
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();

    const startTimeInMinutes = startHour * 60 + startMinute;
    const earliestAllowed = 8 * 60 + 30; // 8:30 AM
    const latestAllowed = 23 * 60; // 11:00 PM

    if (startTimeInMinutes < earliestAllowed || startTimeInMinutes > latestAllowed) {
        return new AppError('Thời gian bắt đầu phải từ 8:30 đến 23:00', 400);
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
    endTime.setMinutes(endTime.getMinutes() + movieDuration + 10);

    return { endTime, movie };
};

const checkConflictingShowtimes = async (roomId, startTime, endTime, showTimeId = null) => {
    try {
        if (!mongoose.isValidObjectId(roomId)) {
            throw new AppError('Room ID không hợp lệ', 400);
        }
        if (!(startTime instanceof Date) || isNaN(startTime)) {
            throw new AppError('Thời gian bắt đầu không hợp lệ', 400);
        }
        if (!(endTime instanceof Date) || isNaN(endTime)) {
            throw new AppError('Thời gian kết thúc không hợp lệ', 400);
        }
        if (startTime >= endTime) {
            throw new AppError('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc', 400);
        }

        const showDate = normalizeToMidnight(startTime);

        const conflictQuery = {
            roomId: new mongoose.Types.ObjectId(roomId),
            isDeleted: false,
            showDate: showDate,
            $and: [
                { startTime: { $lt: endTime } },
                { endTime: { $gt: startTime } },
            ],
        };

        if (showTimeId && mongoose.isValidObjectId(showTimeId)) {
            conflictQuery._id = { $ne: new mongoose.Types.ObjectId(showTimeId) };
        }

        const conflict = await showTimeModel.findOne(conflictQuery);
        return conflict;

    } catch (error) {
        console.error('Lỗi trong checkConflictingShowtimes:', error);
        throw error instanceof AppError ? error : new AppError('Lỗi khi kiểm tra xung đột lịch chiếu', 500);
    }
};

exports.createShowTime = catchAsync(async (req, res, next) => {
    const startTime = new Date(req.body.startTime);
    if (isNaN(startTime.getTime())) {
        return next(new AppError('Thời gian bắt đầu không hợp lệ', 400));
    }

    if (!req.body.roomId) {
        return next(new AppError('Room ID là bắt buộc', 400));
    }
    if (!mongoose.isValidObjectId(req.body.roomId)) {
        return next(new AppError('Room ID không hợp lệ', 400));
    }
    if (!mongoose.isValidObjectId(req.body.movieId)) {
        return next(new AppError('Movie ID không hợp lệ', 400));
    }
    if (!mongoose.isValidObjectId(req.body.formatId)) {
        return next(new AppError('Format ID không hợp lệ', 400));
    }

    let showDate;
    if (req.body.showDate) {
        showDate = new Date(req.body.showDate);
        if (isNaN(showDate.getTime())) {
            return next(new AppError('Ngày chiếu không hợp lệ', 400));
        }
    } else {
        showDate = startTime;
    }
    const normalizedShowDate = normalizeToMidnight(showDate);

    const startDate = normalizeToMidnight(startTime);
    if (normalizedShowDate.getTime() !== startDate.getTime()) {
        return next(new AppError('Ngày chiếu phải trùng với ngày của thời gian bắt đầu', 400));
    }

    const validateStartTimeResult = validateStartTime(startTime, next);
    if (validateStartTimeResult instanceof AppError) {
        return next(validateStartTimeResult);
    }

    let endTime, movie;
    try {
        const result = await calculateEndTime(req.body.movieId, startTime, next);
        endTime = result.endTime;
        movie = result.movie;
    } catch (error) {
        return next(error);
    }

    try {
        const conflictShowTime = await checkConflictingShowtimes(
            req.body.roomId,
            startTime,
            endTime
        );
        if (conflictShowTime) {
            return next(new AppError(
                `Đã có suất chiếu khác trong khoảng thời gian từ ${conflictShowTime.startTime.toISOString()} đến ${conflictShowTime.endTime.toISOString()}`,
                409
            ));
        }
    } catch (error) {
        return next(error);
    }

    req.body.startTime = startTime;
    req.body.endTime = endTime;
    req.body.showDate = normalizedShowDate;

    const doc = await showTimeModel.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});

exports.updateShowTime = catchAsync(async (req, res, next) => {
    if (req.body.startTime || req.body.showDate || req.body.movieId || req.body.roomId) {
        const showtime = await showTimeModel.findById(req.params.id);
        if (!showtime) {
            return next(new AppError('Không tìm thấy suất chiếu', 404));
        }

        const startTime = req.body.startTime ? new Date(req.body.startTime) : showtime.startTime;
        if (req.body.startTime && isNaN(startTime.getTime())) {
            return next(new AppError('Thời gian bắt đầu không hợp lệ', 400));
        }

        if (req.body.startTime) {
            const validateStartTimeResult = validateStartTime(startTime, next);
            if (validateStartTimeResult instanceof AppError) {
                return next(validateStartTimeResult);
            }
        }

        let showDate = req.body.showDate ? new Date(req.body.showDate) : showtime.showDate;
        if (req.body.showDate && isNaN(showDate.getTime())) {
            return next(new AppError('Ngày chiếu không hợp lệ', 400));
        }
        const normalizedShowDate = normalizeToMidnight(showDate);

        const startDate = normalizeToMidnight(startTime);
        if (normalizedShowDate.getTime() !== startDate.getTime()) {
            return next(new AppError('Ngày chiếu phải trùng với ngày của thời gian bắt đầu', 400));
        }

        const movieId = req.body.movieId || showtime.movieId;
        const roomId = req.body.roomId || showtime.roomId;

        let endTime = showtime.endTime;
        if (req.body.startTime || req.body.movieId) {
            const result = await calculateEndTime(movieId, startTime, next);
            endTime = result.endTime;
        }

        const conflictShowTime = await checkConflictingShowtimes(roomId, startTime, endTime, req.params.id);
        if (conflictShowTime) {
            return next(new AppError(
                `Đã có suất chiếu khác trong khoảng thời gian từ ${conflictShowTime.startTime.toISOString()} đến ${conflictShowTime.endTime.toISOString()}`,
                409
            ));
        }

        req.body.startTime = startTime;
        req.body.endTime = endTime;
        req.body.showDate = normalizedShowDate;
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

exports.getAllShowTime = Factory.getAll(showTimeModel, [
    { path: 'movieId' },
    { path: 'roomId', populate: { path: 'cinemaId', select: 'name' } },
    { path: 'formatId' }
]);
exports.getOneShowTimeById = Factory.getOne(showTimeModel, 'movieId roomId formatId');
exports.deleteShowTime = Factory.softDeleteOne(showTimeModel);