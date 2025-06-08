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
    // thời gian kết thúc của một bộ phim cộng với thời gian để dọn dẹp,
    // cũng như để khách đợt sau có thời gian vào là 10 phút
    endTime.setMinutes(endTime.getMinutes() + movieDuration + 10);

    return { endTime, movie };
}

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

        // Lấy ngày từ startTime
        const showDate = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate());

        // Xây dựng truy vấn kiểm tra xung đột
        const conflictQuery = {
            roomId: new mongoose.Types.ObjectId(roomId),
            isDeleted: false,
            showDate: showDate,
            $and: [
                { startTime: { $lt: endTime } },
                { endTime: { $gt: startTime } },
            ],
        };

        // Loại trừ showtime hiện tại khi cập nhật
        if (showTimeId && mongoose.isValidObjectId(showTimeId)) {
            conflictQuery._id = { $ne: new mongoose.Types.ObjectId(showTimeId) };
        }

        // Thực hiện truy vấn
        return await showTimeModel.findOne(conflictQuery);

    } catch (error) {
        console.error('Lỗi trong checkConflictingShowtimes:', error);
        throw error;
    }
};

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

    if (isNaN(startTime.getTime())) {
        return next(new AppError('Thời gian bắt đầu không hợp lệ', 400));
    }

    if (!req.body.roomId) {
        return next(new AppError('Room ID là bắt buộc', 400));
    }

    if (!mongoose.isValidObjectId(req.body.roomId)) {
        return next(new AppError('Room ID không hợp lệ', 400));
    }

    // Kiểm tra khoảng thời gian startTime
    const validateStartTimeResult = validateStartTime(startTime, next);
    if (validateStartTimeResult instanceof AppError) {
        return next(validateStartTimeResult);
    }

    let endTime, movie;
    try {
        const result = await calculateEndTime(req.body.movieId, startTime, next);
        endTime = result.endTime;
        movie = result.movie;
        // console.log('Calculated endTime:', endTime);
    } catch (error) {
        return next(error);
    }

    req.body.endTime = endTime;

    try {
        const conflictShowTime = await checkConflictingShowtimes(
            req.body.roomId,
            startTime,
            endTime
        );
        if (conflictShowTime) {
            return next(new AppError('Đã có suất chiếu khác trong thời gian này', 409));
        }
    } catch (error) {
        console.error('Error in conflict check:', error);
        return next(new AppError('Lỗi khi kiểm tra xung đột lịch chiếu', 500));
    }

    const doc = await showTimeModel.create(req.body);
    // console.log('Created showtime:', doc);

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