const showTimeModel = require("../model/showtimeModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Factory = require("./handleFactory");
const mongoose = require("mongoose");
const showTimeService = require("../services/showTimeService");

exports.getShowTimeFilter = catchAsync(async (req, res, next) => {
    const { date, province ,cinemaId } = req.query;

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
    })
})

// exports.createShowTime = catchAsync(async (req, res, next) => {
//     const startTime = new Date(req.body.startTime);
//     const startHour = startTime.getHours();
//     const startMinute = startTime.getMinutes();
//
//     const startTimeInMinutes = startHour * 60 + startMinute;
//     const earliestAllowed = 8 * 60 + 30;
//     const latestAllowed = 23 * 60;
//
//     if (startTimeInMinutes < earliestAllowed || startTimeInMinutes > latestAllowed) {
//         return next(new AppError('Thời gian bắt đầu phải từ 8:30 đến 23:00', 400));
//     }
//
//     const Movie = mongoose.model('Movie');
//     const movie = await Movie.findById(req.body.movieId);
//     if (!movie) {
//         return next(new AppError('Không tìm thấy thông tin phim', 404));
//     }
//
//     const endTime = new Date(startTime);
//     endTime.setMinutes(endTime.getMinutes() + movie.duration);
//
//     const conflictShowtime = await showTimeModel.findOne({
//         roomId: req.body.roomId,
//         isDeleted: false,
//         $or: [
//             {
//                 startTime: {
//                     $gte: startTime,
//                     $lt: endTime
//                 }
//             },
//             {
//                 $expr: {
//                     $let: {
//                         vars: {
//                             otherEndTime: {
//                                 $add: ['$startTime', { $multiply: [movie.duration, 60 * 1000] }]
//                             }
//                         },
//                         in: {
//                             $and: [
//                                 { $gt: ['$$otherEndTime', startTime] },
//                                 { $lte: ['$startTime', endTime] }
//                             ]
//                         }
//                     }
//                 }
//             }
//         ]
//     });
//
//     if (conflictShowtime) {
//         return next(new AppError('Đã có suất chiếu khác trong khoảng thời gian này', 409));
//     }
//
//     const doc = await showTimeModel.create(req.body);
//     res.status(201).json({
//         status: 'success',
//         data: {
//             data: doc
//         }
//     });
// });

// exports.updateShowTime = catchAsync(async (req, res, next) => {
//     if (req.body.startTime) {
//         const startTime = new Date(req.body.startTime);
//         const startHour = startTime.getHours();
//         const startMinute = startTime.getMinutes();
//
//         const startTimeInMinutes = startHour * 60 + startMinute;
//         const earliestAllowed = 8 * 60 + 30;
//         const latestAllowed = 23 * 60;
//
//         if (startTimeInMinutes < earliestAllowed || startTimeInMinutes > latestAllowed) {
//             return next(new AppError('Thời gian bắt đầu phải từ 8:30 đến 23:00', 400));
//         }
//
//         const showtime = await showTimeModel.findById(req.params.id);
//         if (!showtime) {
//             return next(new AppError('Không tìm thấy suất chiếu', 404));
//         }
//
//         const movieId = req.body.movieId || showtime.movieId;
//         const roomId = req.body.roomId || showtime.roomId;
//
//         const Movie = mongoose.model('Movie');
//         const movie = await Movie.findById(movieId);
//         if (!movie) {
//             return next(new AppError('Không tìm thấy thông tin phim', 404));
//         }
//
//         const endTime = new Date(startTime);
//         endTime.setMinutes(endTime.getMinutes() + movie.duration);
//
//         const conflictShowtime = await showTimeModel.findOne({
//             roomId: roomId,
//             _id: { $ne: req.params.id },
//             isDeleted: false,
//             $or: [
//                 {
//                     startTime: {
//                         $gte: startTime,
//                         $lt: endTime
//                     }
//                 },
//                 {
//                     $expr: {
//                         $let: {
//                             vars: {
//                                 otherEndTime: {
//                                     $add: ['$startTime', { $multiply: [movie.duration, 60 * 1000] }]
//                                 }
//                             },
//                             in: {
//                                 $and: [
//                                     { $gt: ['$$otherEndTime', startTime] },
//                                     { $lte: ['$startTime', endTime] }
//                                 ]
//                             }
//                         }
//                     }
//                 }
//             ]
//         });
//
//         if (conflictShowtime) {
//             return next(new AppError('Đã có suất chiếu khác trong khoảng thời gian này', 409));
//         }
//     }
//
//     const doc = await showTimeModel.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true
//     });
//
//     if (!doc) {
//         return next(new AppError('Không tìm thấy suất chiếu với ID này', 404));
//     }
//
//     res.status(200).json({
//         status: 'success',
//         data: {
//             data: doc
//         }
//     });
// });

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

    const movieDuration = 120;

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + movieDuration);

    const conflictShowtime = await showTimeModel.findOne({
        roomId: req.body.roomId,
        isDeleted: false,
        $or: [
            {
                startTime: {
                    $gte: startTime,
                    $lt: endTime
                }
            },
            {
                $expr: {
                    $let: {
                        vars: {
                            otherEndTime: {
                                $add: ['$startTime', { $multiply: [movieDuration, 60 * 1000] }]
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

    if (!req.body.movieId) {
        req.body.movieId = new mongoose.Types.ObjectId();
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

        if (!req.body.movieId && !showtime.movieId) {
            req.body.movieId = new mongoose.Types.ObjectId();
        }

        const roomId = req.body.roomId || showtime.roomId;

        const movieDuration = 120;

        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + movieDuration);

        const conflictShowtime = await showTimeModel.findOne({
            roomId: roomId,
            _id: { $ne: req.params.id },
            isDeleted: false,
            $or: [
                {
                    startTime: {
                        $gte: startTime,
                        $lt: endTime
                    }
                },
                {
                    $expr: {
                        $let: {
                            vars: {
                                otherEndTime: {
                                    $add: ['$startTime', { $multiply: [movieDuration, 60 * 1000] }]
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

    if (!req.body.movieId) {
        const showtime = await showTimeModel.findById(req.params.id);
        if (!showtime || !showtime.movieId) {
            req.body.movieId = new mongoose.Types.ObjectId();
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


exports.getAllShowTime = Factory.getAll(showTimeModel, 'roomId formatId');
exports.getOneShowTimeById = Factory.getOne(showTimeModel, 'roomId formatId');
exports.deleteShowTime = Factory.softDeleteOne(showTimeModel);