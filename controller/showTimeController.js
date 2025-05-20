const showTimeModel = require("../model/showtimeModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Factory = require("./handleFactory");
const mongoose = require("mongoose");

exports.createShowTime = catchAsync(async (req, res, next) => {
    // Kiểm tra thời gian bắt đầu có nằm trong khoảng 8:30-23:00 không
    const startTime = new Date(req.body.startTime);
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();

    // Chuyển đổi thành phút để dễ so sánh
    const startTimeInMinutes = startHour * 60 + startMinute;
    const earliestAllowed = 8 * 60 + 30; // 8:30 = 510 phút
    const latestAllowed = 23 * 60; // 23:00 = 1380 phút

    if (startTimeInMinutes < earliestAllowed || startTimeInMinutes > latestAllowed) {
        return next(new AppError('Thời gian bắt đầu phải từ 8:30 đến 23:00', 400));
    }
    //
    // // Kiểm tra thời gian bắt đầu có phải là bội số của 30 phút từ 8:30 không
    // const minutesSince830 = startTimeInMinutes - earliestAllowed;
    // if (minutesSince830 % 30 !== 0) {
    //     return next(new AppError('Thời gian bắt đầu phải cách nhau 30 phút (8:30, 9:00, 9:30, ...)', 400));
    // }

    // Lấy thông tin phim để biết thời lượng
    const Movie = mongoose.model('Movie');
    const movie = await Movie.findById(req.body.movieId);
    if (!movie) {
        return next(new AppError('Không tìm thấy thông tin phim', 404));
    }

    // Tính thời gian kết thúc
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + movie.duration);

    // Kiểm tra trùng lịch trong cùng phòng
    const conflictShowtime = await showTimeModel.findOne({
        roomId: req.body.roomId,
        isDeleted: false,
        $or: [
            // Suất chiếu khác bắt đầu trong khoảng thời gian của suất này
            {
                startTime: {
                    $gte: startTime,
                    $lt: endTime
                }
            },
            // Suất chiếu khác kết thúc trong khoảng thời gian của suất này
            {
                $expr: {
                    $let: {
                        vars: {
                            otherEndTime: {
                                $add: ['$startTime', { $multiply: [movie.duration, 60 * 1000] }]
                            }
                        },
                        in: {
                            $and: [
                                { $gt: ['$$otherEndTime', startTime] },
                                { $lte: ['$startTime', endTime] }
                            ]
                        }
                    }
                }
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
    // Nếu có cập nhật thời gian bắt đầu
    if (req.body.startTime) {
        // Kiểm tra thời gian bắt đầu có nằm trong khoảng 8:30-23:00 không
        const startTime = new Date(req.body.startTime);
        const startHour = startTime.getHours();
        const startMinute = startTime.getMinutes();

        // Chuyển đổi thành phút để dễ so sánh
        const startTimeInMinutes = startHour * 60 + startMinute;
        const earliestAllowed = 8 * 60 + 30; // 8:30 = 510 phút
        const latestAllowed = 23 * 60; // 23:00 = 1380 phút

        if (startTimeInMinutes < earliestAllowed || startTimeInMinutes > latestAllowed) {
            return next(new AppError('Thời gian bắt đầu phải từ 8:30 đến 23:00', 400));
        }

        // Lấy thông tin suất chiếu hiện tại
        const showtime = await showTimeModel.findById(req.params.id);
        if (!showtime) {
            return next(new AppError('Không tìm thấy suất chiếu', 404));
        }

        // Lấy movie từ showtime hiện tại hoặc từ request body nếu có cập nhật movie
        const movieId = req.body.movieId || showtime.movieId;
        const roomId = req.body.roomId || showtime.roomId;

        // Lấy thông tin phim để biết thời lượng
        const Movie = mongoose.model('Movie');
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return next(new AppError('Không tìm thấy thông tin phim', 404));
        }

        // Tính thời gian kết thúc
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + movie.duration);

        // Kiểm tra trùng lịch trong cùng phòng
        const conflictShowtime = await showTimeModel.findOne({
            roomId: roomId,
            _id: { $ne: req.params.id }, // Loại trừ chính suất chiếu này khi đang update
            isDeleted: false,
            $or: [
                // Suất chiếu khác bắt đầu trong khoảng thời gian của suất này
                {
                    startTime: {
                        $gte: startTime,
                        $lt: endTime
                    }
                },
                // Suất chiếu khác kết thúc trong khoảng thời gian của suất này
                {
                    $expr: {
                        $let: {
                            vars: {
                                otherEndTime: {
                                    $add: ['$startTime', { $multiply: [movie.duration, 60 * 1000] }]
                                }
                            },
                            in: {
                                $and: [
                                    { $gt: ['$$otherEndTime', startTime] },
                                    { $lte: ['$startTime', endTime] }
                                ]
                            }
                        }
                    }
                }
            ]
        });

        if (conflictShowtime) {
            return next(new AppError('Đã có suất chiếu khác trong khoảng thời gian này', 409));
        }
    }

    // Nếu không có vấn đề, cập nhật suất chiếu
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