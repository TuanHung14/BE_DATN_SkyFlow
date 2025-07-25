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
                // showDate: {
                //     $gte: startOfDay,
                //     $lte: endOfDay
                // },
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
            // Join với collection rooms để lấy thông tin phòng chiếu
            $lookup: {
                from: 'rooms',
                localField: 'roomId',
                foreignField: '_id',
                as: 'room'
            }
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
            // Unwind các array từ lookup
            $unwind: '$movie'
        },
        {
            $unwind: '$room'
        },
        {
            $unwind: '$cinema'
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


module.exports = { getCountShowtimeNow, getShowtimes };
