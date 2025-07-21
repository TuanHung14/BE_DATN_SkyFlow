const Movie = require('../model/movieModel');
const Showtime = require('../model/showtimeModel');
const Room = require("../model/roomModel");
const Cinema = require("../model/cinemaModel");
const catchAsync = require("../utils/catchAsync");
const mongoose = require('mongoose');

exports.getTicketBooking = catchAsync(async (req, res, next) => {
    const { movieId, showDate, cinemaId, showtimeId } = req.query;

    // 1. Nếu không có tham số: Trả về danh sách phim đang chiếu
    if (!movieId && !showDate && !cinemaId && !showtimeId) {
        const movies = await Movie.find({
            status: 'NOW_SHOWING',
            isDeleted: false,
            publishStatus: 'PUBLISHED'
        })
            .select('name posterUrl slug format')
            .sort('-releaseDate');

        return res.json({
            status: 'success',
            step: 'movies',
            results: movies.length,
            data: movies
        });
    }

    // Kiểm tra movieId hợp lệ cho các bước tiếp theo
    if (movieId && !mongoose.Types.ObjectId.isValid(movieId)) {
        return res.status(400).json({
            status: 'error',
            message: 'ID phim không hợp lệ'
        });
    }

    // 2. Nếu chỉ có movieId: Trả về danh sách ngày chiếu của phim
    if (movieId && !showDate && !cinemaId && !showtimeId) {
        const showtimes = await Showtime.find({
            movieId,
            showDate: { $gte: new Date().setHours(0, 0, 0, 0) },
            isDeleted: false,
            status: 'scheduled'
        })
            .select('showDate')
            .distinct('showDate')
            .sort('showDate');

        return res.json({
            status: 'success',
            step: 'show-dates',
            results: showtimes.length,
            data: showtimes.map(date => ({
                date: date.toISOString().split('T')[0],
                timestamp: date.getTime()
            }))
        });
    }

    // 3. Nếu có movieId và showDate: Trả về danh sách rạp chiếu
    if (movieId && showDate && !cinemaId && !showtimeId) {
        const startOfDay = new Date(showDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(showDate);
        endOfDay.setHours(23, 59, 59, 999);

        const showtimes = await Showtime.find({
            movieId,
            showDate: { $gte: startOfDay, $lte: endOfDay },
            isDeleted: false,
            status: 'scheduled'
        })
            .populate({
                path: 'roomId',
                match: { isDeleted: false, status: 'active' },
                select: 'cinemaId',
                populate: {
                    path: 'cinemaId',
                    match: { isDeleted: false },
                    select: 'name address province district ward'
                }
            });

        const cinemas = [];
        const cinemaIds = new Set();

        showtimes.forEach(showtime => {
            if (showtime.roomId && showtime.roomId.cinemaId && !cinemaIds.has(showtime.roomId.cinemaId._id.toString())) {
                cinemaIds.add(showtime.roomId.cinemaId._id.toString());
                cinemas.push(showtime.roomId.cinemaId);
            }
        });

        return res.json({
            status: 'success',
            step: 'cinemas',
            results: cinemas.length,
            data: cinemas
        });
    }

    // 4. Nếu có movieId, showDate, và cinemaId: Trả về danh sách suất chiếu
    if (movieId && showDate && cinemaId && !showtimeId) {
        if (!mongoose.Types.ObjectId.isValid(cinemaId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID rạp không hợp lệ'
            });
        }

        const startOfDay = new Date(showDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(showDate);
        endOfDay.setHours(23, 59, 59, 999);

        const showtimes = await Showtime.find({
            movieId,
            showDate: { $gte: startOfDay, $lte: endOfDay },
            isDeleted: false,
            status: 'scheduled'
        })
            .populate({
                path: 'roomId',
                match: {
                    cinemaId: new mongoose.Types.ObjectId(cinemaId),
                    isDeleted: false,
                    status: 'active'
                },
                select: 'roomName capacity formats',
                populate: {
                    path: 'formats',
                    select: 'name'
                }
            })
            .populate({
                path: 'formatId',
                select: 'name'
            })
            .sort('startTime');

        const validShowtimes = showtimes.filter(st => st.roomId);

        return res.json({
            status: 'success',
            step: 'showtimes',
            results: validShowtimes.length,
            data: validShowtimes.map(st => ({
                showtimeId: st._id,
                roomName: st.roomId.roomName,
                format: st.formatId.name,
                startTime: st.startTime,
                endTime: st.endTime,
                capacity: st.roomId.capacity
            }))
        });
    }

    // 5. Nếu có showtimeId: Trả về thông tin suất chiếu để chọn ghế
    if (showtimeId) {
        if (!mongoose.Types.ObjectId.isValid(showtimeId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID suất chiếu không hợp lệ'
            });
        }

        const showtime = await Showtime.findOne({
            _id: showtimeId,
            isDeleted: false,
            status: 'scheduled'
        })
            .populate('movieId', 'name')
            .populate({
                path: 'roomId',
                select: 'roomName cinemaId',
                populate: {
                    path: 'cinemaId',
                    select: 'name address'
                }
            })
            .populate('formatId', 'name');

        if (!showtime) {
            return res.status(404).json({
                status: 'error',
                message: 'Không tìm thấy suất chiếu'
            });
        }

        return res.json({
            status: 'success',
            step: 'seat-selection',
            data: {
                showtimeId: showtime._id,
                movieName: showtime.movieId.name,
                cinemaName: showtime.roomId.cinemaId.name,
                cinemaAddress: showtime.roomId.cinemaId.address,
                roomName: showtime.roomId.roomName,
                format: showtime.formatId.name,
                showDate: showtime.showDate,
                startTime: showtime.startTime,
                endTime: showtime.endTime
            }
        });
    }

    // Trường hợp tham số không hợp lệ
    return res.status(400).json({
        status: 'error',
        message: 'Tham số không hợp lệ'
    });
})