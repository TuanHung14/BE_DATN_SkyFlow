const Showtime = require("../model/showtimeModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Factory = require("./handleFactory");
const Movie = require("../model/movieModel");
const Room = require("../model/roomModel");
const mongoose = require('mongoose');

const validateStartTime = (startTime, next) => {
    const startHour = startTime.getUTCHours();
    const startMinute = startTime.getUTCMinutes();

    const startTimeInMinutes = startHour * 60 + startMinute;
    const earliestAllowed = 60 + 30;
    const latestAllowed = 16 * 60;

    if (startTimeInMinutes < earliestAllowed || startTimeInMinutes > latestAllowed) {
        return new AppError('Thời gian bắt đầu phải từ 8:30 đến 23:00', 400);
    }

    return true;
};

const calculateEndTime = async (movieId, startTime, next) => {
    const movie = await Movie.findById(movieId);
    if (!movie) {
        return next(new AppError('Không tìm thấy thông tin phim', 404));
    }
    const movieDuration = movie.duration;
    const endTime = new Date(startTime);
    // thời gian kết thúc của một bộ phim cộng với thời gian để dọn dẹp,
    // cũng như để khách đợt sau có thời gian vào là 10 phút
    endTime.setMinutes(endTime.getMinutes() + movieDuration + 10);

    return {endTime, movie};
}

const checkConflictingShowtimes = async (roomId, startTime, endTime, movieId, showTimeId = null) => {
    try {
        if (!mongoose.isValidObjectId(roomId)) {
            throw new AppError('Room ID không hợp lệ', 400);
        }
        if (!mongoose.isValidObjectId(movieId)) {
            throw new AppError('Movie ID không hợp lệ', 400);
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
        const showDate = new Date(Date.UTC(
            startTime.getUTCFullYear(),
            startTime.getUTCMonth(),
            startTime.getUTCDate()
        ));

        // Lấy thông tin phòng chiếu để có thể tìm rạp
        const room = await Room.findById(roomId);
        if (!room) {
            throw new AppError('Không tìm thấy phòng chiếu', 404);
        }

        // Tìm tất cả phòng cùng rạp
        const roomsInSameCinema = await Room.find({
            cinemaId: room.cinemaId,
            isDeleted: false
        }).select('_id');

        const roomIds = roomsInSameCinema.map(r => r._id);

        // Kiểm tra xung đột 1: Cùng phòng chiếu có suất chiếu trùng thời gian
        const roomConflictQuery = {
            roomId: new mongoose.Types.ObjectId(roomId),
            isDeleted: false,
            showDate: showDate,
            $or: [
                // Trường hợp 1: Suất chiếu mới bắt đầu trong khoảng thời gian của suất chiếu cũ
                {
                    startTime: {$lte: startTime},
                    endTime: {$gt: startTime}
                },
                // Trường hợp 2: Suất chiếu mới kết thúc trong khoảng thời gian của suất chiếu cũ
                {
                    startTime: {$lt: endTime},
                    endTime: {$gte: endTime}
                },
                // Trường hợp 3: Suất chiếu mới bao trùm suất chiếu cũ
                {
                    startTime: {$gte: startTime},
                    endTime: {$lte: endTime}
                }
            ]
        };

        // Loại trừ showtime hiện tại khi cập nhật
        if (showTimeId) {
            roomConflictQuery._id = {$ne: showTimeId};
        }

        // Kiểm tra xung đột phòng chiếu
        const roomConflict = await Showtime.findOne(roomConflictQuery);

        if (roomConflict) {
            const nextAvailableTime = new Date(roomConflict.endTime);
            throw new AppError(
                `Xung đột thời gian trong phòng chiếu! Suất chiếu từ ${startTime.toLocaleTimeString('vi-VN')} đến ${endTime.toLocaleTimeString('vi-VN')} xung đột với suất chiếu hiện có từ ${roomConflict.startTime.toLocaleTimeString('vi-VN')} đến ${roomConflict.endTime.toLocaleTimeString('vi-VN')}. Có thể tạo suất chiếu từ ${nextAvailableTime.toLocaleTimeString('vi-VN')} trở đi.`,
                409
            );
        }

        // Kiểm tra xung đột 2: Cùng bộ phim, cùng thời gian bắt đầu, cùng rạp nhưng khác phòng
        const movieConflictQuery = {
            movieId: new mongoose.Types.ObjectId(movieId),
            roomId: { $in: roomIds },
            startTime: startTime,
            showDate: showDate,
            isDeleted: false
        };

        // Loại trừ showtime hiện tại khi cập nhật
        if (showTimeId && mongoose.isValidObjectId(showTimeId)) {
            movieConflictQuery._id = {$ne: new mongoose.Types.ObjectId(showTimeId)};
        }

        // Kiểm tra xung đột bộ phim
        const movieConflict = await Showtime.findOne(movieConflictQuery).populate('roomId', 'name');

        if (movieConflict) {
            throw new AppError(
                `Xung đột suất chiếu phim! Bộ phim này đã có suất chiếu lúc ${startTime.toLocaleTimeString('vi-VN')} trong phòng "${movieConflict.roomId.name}" cùng ngày. Một bộ phim không thể có hai suất chiếu cùng thời gian trong cùng một rạp.`,
                409
            );
        }

        return null;

    } catch (error) {
        console.error('Lỗi trong checkConflictingShowtimes:', error);
        throw error;
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
    } catch (error) {
        return next(error);
    }

    req.body.endTime = endTime;

    try {
        const conflictShowTime = await checkConflictingShowtimes(
            req.body.roomId,
            startTime,
            endTime,
            req.body.movieId
        );
        if (conflictShowTime) {
            return next(new AppError('Đã có suất chiếu khác trong thời gian này', 409));
        }
    } catch (error) {
        console.error('Error in conflict check:', error);
        return next(error);
    }

    const doc = await Showtime.create(req.body);
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

        const showtime = await Showtime.findById(req.params.id);
        if (!showtime) {
            return next(new AppError('Không tìm thấy suất chiếu', 404));
        }

        const movieId = req.body.movieId || showtime.movieId;
        const roomId = req.body.roomId || showtime.roomId;

        const {endTime} = await calculateEndTime(movieId, startTime, next);
        req.body.endTime = endTime;

        const conflicShowTime = await checkConflictingShowtimes(roomId, startTime, endTime, movieId, req.params.id);
        if (conflicShowTime) {
            return next(new AppError('Đã có suất chiếu khác trong thời gian này', 409));
        }
    }

    const doc = await Showtime.findByIdAndUpdate(req.params.id, req.body, {
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

exports.getAllShowTime = catchAsync(async (req, res) => {
    const filter = {};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const skip = (page - 1) * limit;

    // 1. Search by movie name
    let searchTerm = req.query.search?.name || req.query['search[name]'];
    if (searchTerm) {
        // Loại bỏ khoảng trắng thừa
        searchTerm = searchTerm.trim();
        if (!searchTerm) {
            return res.status(200).json({
                status: 'success',
                data: { data: [] },
                page: page,
                totalPages: 0,
                total: 0,
                message: 'Chuỗi tìm kiếm rỗng'
            });
        }

        // Tìm phim theo tên
        const movies = await Movie.find({
            name: { $regex: searchTerm, $options: 'i' },
            isDeleted: { $ne: true }
        }).select('_id name');

        if (!movies.length) {
            return res.status(200).json({
                status: 'success',
                data: { data: [] },
                page: page,
                totalPages: 0,
                total: 0,
                message: 'Không tìm thấy phim nào'
            });
        }

        filter.movieId = { $in: movies.map(movie => movie._id) };
    }

    // 2. Filter by cinema
    if (req.query.cinemaId) {
        if (!mongoose.Types.ObjectId.isValid(req.query.cinemaId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID rạp không hợp lệ'
            });
        }

        const cinemaId = new mongoose.Types.ObjectId(req.query.cinemaId);
        const rooms = await Room.find({
            cinemaId: cinemaId,
            isDeleted: { $ne: true }
        }).select('_id roomName');
        if (rooms.length === 0) {
            return res.status(200).json({
                status: 'success',
                data: { data: [] },
                page: page,
                totalPages: 0,
                total: 0,
                message: 'Không tìm thấy phòng nào cho rạp này'
            });
        }

        const roomIds = rooms.map(room => room._id);

        if (req.query.roomId) {
            const requestedRoomId = new mongoose.Types.ObjectId(req.query.roomId);
            const isRoomInCinema = roomIds.some(id => id.equals(requestedRoomId));

            if (isRoomInCinema) {
                filter.roomId = requestedRoomId;
            } else {
                return res.status(200).json({
                    status: 'success',
                    data: { data: [] },
                    page: page,
                    totalPages: 0,
                    total: 0,
                    message: 'Phòng không thuộc rạp được chọn'
                });
            }
        } else {
            filter.roomId = { $in: roomIds };
        }
    } else if (req.query.roomId) {
        if (!mongoose.Types.ObjectId.isValid(req.query.roomId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID phòng không hợp lệ'
            });
        }

        filter.roomId = new mongoose.Types.ObjectId(req.query.roomId);
    }

    // 3. Filter by status
    if (req.query.status) {
        const validStatuses = ['scheduled', 'ongoing', 'finished'];
        if (!validStatuses.includes(req.query.status)) {
            return res.status(400).json({
                status: 'error',
                message: 'Trạng thái không hợp lệ'
            });
        }

        filter.status = req.query.status;
    }

    // 4. Exclude deleted records
    filter.isDeleted = { $ne: true };

    // Execute query with populate
    const showtimes = await Showtime.find(filter)
        .populate({
            path: 'movieId',
            select: 'name posterUrl duration isDeleted',
            match: { isDeleted: { $ne: true } }
        })
        .populate({
            path: 'roomId',
            select: 'roomName isDeleted',
            match: { isDeleted: { $ne: true } },
            populate: {
                path: 'cinemaId',
                select: 'name location isDeleted',
                match: { isDeleted: { $ne: true } }
            }
        })
        .populate({
            path: 'formatId',
            select: 'name price isDeleted',
            match: { isDeleted: { $ne: true } }
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    // console.log('showtime: ', showtimes)
    // Filter out showtimes where populated fields are null (due to match conditions)
    const filteredShowtimes = showtimes.filter(showtime =>
        showtime.movieId &&
        showtime.roomId &&
        showtime.roomId.cinemaId &&
        showtime.formatId
    );

    const total = await Showtime.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
        status: 'success',
        data: { data: filteredShowtimes },
        page: page,
        totalPages: totalPages,
        total: total,
        results: filteredShowtimes.length
    });
});

exports.getOneShowTimeById = Factory.getOne(Showtime, 'movieId roomId formatId');

exports.deleteShowTime = Factory.softDeleteOne(Showtime);