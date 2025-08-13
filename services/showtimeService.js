// movieService.js
const Showtime = require("../model/showtimeModel");

async function getCountShowtimeNow() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Bắt đầu ngày hôm nay UTC
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1); // Bắt đầu ngày mai UTC

    return await Showtime.countDocuments({
        showDate: {
            $gte: today,
            $lt: tomorrow
        },
        isDeleted: false,
    });
}

async function getShowtimes() {
    const targetDate = new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const showtimes = await Showtime.aggregate([
        {
            // Lọc theo ngày chiếu
            $match: {
                showDate: {
                    $gte: startOfDay,
                    $lte: endOfDay
                },
                status: "scheduled"
            }
        },
        {
            // Join với collection movies để lấy thông tin phim
            $lookup: {
                from: 'movies',
                localField: 'movieId',
                foreignField: '_id',
                as: 'movie'
            }
        },
        {
            // Unwind các array từ lookup
            $unwind: '$movie'
        },
        {
            // Join với collection rooms để lấy thông tin phòng chiếu
            $lookup: {
                from: 'rooms',
                localField: 'roomId',
                foreignField: '_id',
                as: 'room'
            }
        },
        {
            $unwind: '$room'
        },
        {
            // Join với collection cinemas để lấy thông tin rạp
            $lookup: {
                from: 'cinemas',
                localField: 'room.cinemaId',
                foreignField: '_id',
                as: 'cinema'
            }
        },
        {
            $unwind: '$cinema'
        },
        {
            $lookup: {
                from: 'bookings',
                localField: '_id',
                foreignField: 'showtimeId',
                pipeline: [
                    {
                        $match: { status: "success" }
                    }
                ],
                as: 'booking'
            }
        },
        {
            $addFields: {
                remainingSeats: {
                    $subtract: [  //$subtract trừ capacity cho số đã đặt.
                        '$room.capacity',
                        { $size: '$booking' } //đếm số document trong mảng booking.
                    ]
                }
            }
        },
        {
            $addFields: {
                startTime: {
                    $dateToString: {
                        format: "%H:%M %d/%m/%Y",
                        date: "$startTime",
                        timezone: "Asia/Ho_Chi_Minh"
                    }
                },
                showDate: {
                    $dateToString: {
                        format: "%d/%m/%Y",
                        date: "$showDate",
                        timezone: "Asia/Ho_Chi_Minh"
                    }
                }
            }
        },
        {
            // Group theo cinema để tổ chức dữ liệu
            $group: {
                _id: '$cinema._id',
                cinemaName: { $first: '$cinema.name' },
                cinemaDescription: { $first: '$cinema.description' },
                remainingSeats: { $first: '$remainingSeats' },
                showtimes: {
                    $push: {
                        showtimeId: '$_id',
                        movieName: '$movie.name',
                        movieSlug: '$movie.slug',
                        roomName: '$room.room_name',
                        startTime: '$startTime',
                        showDate: '$showDate',
                        format: '$format'
                    }
                }
            }
        },
        {
            // Sắp xếp theo tên rạp
            $sort: { cinemaName: 1 }
        },
        {
            // Sắp xếp showtimes theo thời gian
            $addFields: {
                showtimes: {
                    $sortArray: {
                        input: '$showtimes',
                        sortBy: { startTime: 1 }
                    }
                }
            }
        }
    ]);

    return showtimes;
}

async function getAllShowtimes(){
    const showtimes = await Showtime.aggregate([
        {
            // Lọc theo ngày chiếu
            $match: {
                status: "scheduled"
            }
        },
        {
            // Join với collection movies để lấy thông tin phim
            $lookup: {
                from: 'movies',
                localField: 'movieId',
                foreignField: '_id',
                as: 'movie'
            }
        },
        {
            // Unwind các array từ lookup
            $unwind: '$movie'
        },
        {
            // Join với collection rooms để lấy thông tin phòng chiếu
            $lookup: {
                from: 'rooms',
                localField: 'roomId',
                foreignField: '_id',
                as: 'room'
            }
        },
        {
            $unwind: '$room'
        },
        {
            // Join với collection cinemas để lấy thông tin rạp
            $lookup: {
                from: 'cinemas',
                localField: 'room.cinemaId',
                foreignField: '_id',
                as: 'cinema'
            }
        },
        {
            $unwind: '$cinema'
        },
        {
            $lookup: {
                from: 'bookings',
                localField: '_id',
                foreignField: 'showtimeId',
                pipeline: [
                    {
                        $match: { status: "success" }
                    }
                ],
                as: 'booking'
            }
        },
        {
            $addFields: {
                remainingSeats: {
                    $subtract: [  //$subtract trừ capacity cho số đã đặt.
                        '$room.capacity',
                        { $size: '$booking' } //đếm số document trong mảng booking.
                    ]
                }
            }
        },
        {
            $addFields: {
                startTime: {
                    $dateToString: {
                        format: "%H:%M %d/%m/%Y",
                        date: "$startTime",
                        timezone: "Asia/Ho_Chi_Minh"
                    }
                },
                showDate: {
                    $dateToString: {
                        format: "%d/%m/%Y",
                        date: "$showDate",
                        timezone: "Asia/Ho_Chi_Minh"
                    }
                }
            }
        },
        {
            // Group theo cinema để tổ chức dữ liệu
            $group: {
                _id: '$cinema._id',
                cinemaName: { $first: '$cinema.name' },
                cinemaDescription: { $first: '$cinema.description' },
                showtimes: {
                    $push: {
                        showtimeId: '$_id',
                        remainingSeats: '$remainingSeats',
                        movieName: '$movie.name',
                        movieSlug: '$movie.slug',
                        roomName: '$room.room_name',
                        startTime: '$startTime',
                        showDate: '$showDate',
                        format: '$format'
                    }
                }
            }
        },
        {
            // Sắp xếp theo tên rạp
            $sort: { cinemaName: 1 }
        },
        {
            // Sắp xếp showtimes theo thời gian
            $addFields: {
                showtimes: {
                    $sortArray: {
                        input: '$showtimes',
                        sortBy: { startTime: 1 }
                    }
                }
            }
        }
    ]);

    return showtimes;
}


module.exports = { getCountShowtimeNow, getShowtimes, getAllShowtimes };
