const mongoose = require('mongoose');
const showTimeModel = require('../model/showtimeModel');

// Tạo filter cơ bản
const createFilter = (params) => {
    const {date, province, cinemaId} = params;
    const filter = {isDeleted: false};

    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(8, 30, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 0, 0, 0);

        filter.showDate = {
            $gte: startOfDay,
            $lte: endOfDay
        };
    }

    if (province) {
        filter.province = province;
    }

    return filter;
};

// Lấy danh sách showtime với filter
exports.getShowtimes = async (params) => {
    try {
        const filter = createFilter(params);
        const { cinemaId } = params;

        const pipeline = [
            { $match: filter },
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'roomId',
                    foreignField: '_id',
                    as: 'room'
                }
            }
        ];

        if (cinemaId) {
            try {
                const cinemaObjectId = new mongoose.Types.ObjectId(cinemaId);
                pipeline.push({
                    $match: {
                        'room.cinemaId': cinemaObjectId
                    }
                });
            } catch (error) {
                pipeline.push({
                    $match: {
                        'room.cinemaId': cinemaId
                    }
                });
            }
        }

        pipeline.push(
            {
                $lookup: {
                    from: 'movies',
                    localField: 'movieId',
                    foreignField: '_id',
                    as: 'movie'
                }
            },
            {
                $lookup: {
                    from: 'formats',
                    localField: 'formatId',
                    foreignField: '_id',
                    as: 'format'
                }
            },
            {
                $lookup: {
                    from: 'cinemas',
                    localField: 'room.cinemaId',
                    foreignField: '_id',
                    as: 'cinema'
                }
            },
            {
                $project: {
                    _id: 1,
                    showDate: 1,
                    startTime: 1,
                    movie: { $arrayElemAt: ['$movie', 0] },
                    room: { $arrayElemAt: ['$room', 0] },
                    cinema: { $arrayElemAt: ['$cinema', 0] },
                    format: { $arrayElemAt: ['$format', 0] }
                }
            },
            {
                $project: {
                    _id: 1,
                    showDate: 1,
                    startTime: 1,
                    'movie._id': 1,
                    'movie.name': 1,
                    'movie.duration': 1,
                    'movie.posterUrl': 1,
                    'room._id': 1,
                    'room.roomName': 1,
                    'room.capacity': 1,
                    'cinema._id': 1,
                    'cinema.name': 1,
                    'cinema.province': 1,
                    'format._id': 1,
                    'format.name': 1
                }
            }
        );
        
        return await showTimeModel.aggregate(pipeline);
    } catch (error) {
        console.error('Error in getShowtimes:', error);
        throw error;
    }
};

// API 1: Lấy danh sách ngày có suất chiếu theo rạp
exports.getAvailableDates = async (cinemaId) => {
    try {
        if (!cinemaId) {
            throw new Error('Cinema ID is required');
        }

        const cinemaObjectId = new mongoose.Types.ObjectId(cinemaId);
        
        const pipeline = [
            { 
                $match: { 
                    isDeleted: false,
                    startTime: { $gte: new Date() }
                } 
            },
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'roomId',
                    foreignField: '_id',
                    as: 'room'
                }
            },
            {
                $match: {
                    'room.cinemaId': cinemaObjectId
                }
            },
            {
                $project: {
                    showDateOnly: {
                        $dateToString: { format: "%Y-%m-%d", date: "$showDate" }
                    }
                }
            },
            {
                $group: {
                    _id: "$showDateOnly",
                    date: { $first: "$showDateOnly" }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    _id: 0,
                    date: 1
                }
            }
        ];

        return await showTimeModel.aggregate(pipeline);
    } catch (error) {
        console.error('Error getting available dates:', error);
        throw error;
    }
};

// API 2: Lấy danh sách suất chiếu theo rạp và ngày
exports.getShowtimesByDateAndCinema = async (cinemaId, date) => {
    try {
        if (!cinemaId || !date) {
            throw new Error('Both cinema ID and date are required');
        }

        const cinemaObjectId = new mongoose.Types.ObjectId(cinemaId);
        
        const searchDate = new Date(date);
        const dateString = searchDate.toISOString().split('T')[0];

        const pipeline = [
            { 
                $match: { 
                    isDeleted: false
                } 
            },
            {
              $addFields: {
                  showDateString: {
                      $dateToString: { format: "%Y-%m-%d", date: "$showDate" }
                  }
              }
            },
            {
                $match: {
                    showDateString: dateString
                }
            },
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'roomId',
                    foreignField: '_id',
                    as: 'room'
                }
            },
            {
                $match: {
                    'room.cinemaId': cinemaObjectId
                }
            },
            {
                $lookup: {
                    from: 'movies',
                    localField: 'movieId',
                    foreignField: '_id',
                    as: 'movie'
                }
            },
            {
                $lookup: {
                    from: 'formats',
                    localField: 'formatId',
                    foreignField: '_id',
                    as: 'format'
                }
            },
            {
                $lookup: {
                    from: 'cinemas',
                    localField: 'room.cinemaId',
                    foreignField: '_id',
                    as: 'cinema'
                }
            },
            {
                $project: {
                    _id: 1,
                    showDate: 1,
                    startTime: 1,
                    endTime: 1,
                    movie: { $arrayElemAt: ['$movie', 0] },
                    room: { $arrayElemAt: ['$room', 0] },
                    cinema: { $arrayElemAt: ['$cinema', 0] },
                    format: { $arrayElemAt: ['$format', 0] }
                }
            },
            {
                $project: {
                    _id: 1,
                    showDate: 1,
                    startTime: 1,
                    endTime: 1,
                    'movie._id': 1,
                    'movie.name': 1,
                    'movie.duration': 1,
                    'movie.posterUrl': 1,
                    'room._id': 1,
                    'room.roomName': 1,
                    'room.capacity': 1,
                    'cinema._id': 1,
                    'cinema.name': 1,
                    'cinema.province': 1,
                    'format._id': 1,
                    'format.name': 1
                }
            },
            {
                $sort: { startTime: 1 }
            }
        ];

        return await showTimeModel.aggregate(pipeline);
    } catch (error) {
        console.error('Error getting showtimes by date and cinema:', error);
        throw error;
    }
};

// API 3: Lấy danh sách tỉnh/thành phố có chiếu phim cụ thể
exports.getProvincesByMovie = async (movieId) => {
    try {
        if (!movieId) {
            throw new Error('Movie ID is required');
        }

        const movieObjectId = new mongoose.Types.ObjectId(movieId);
        
        const pipeline = [
            { 
                $match: { 
                    movieId: movieObjectId,
                    isDeleted: false,
                    startTime: { $gte: new Date() }
                } 
            },
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'roomId',
                    foreignField: '_id',
                    as: 'room'
                }
            },
            {
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
                $group: {
                    _id: '$cinema.province',
                    province: { $first: '$cinema.province' }
                }
            },
            {
                $project: {
                    _id: 0,
                    province: 1
                }
            },
            {
                $sort: { province: 1 }
            }
        ];

        return await showTimeModel.aggregate(pipeline);
    } catch (error) {
        console.error('Error getting provinces by movie:', error);
        throw error;
    }
};

// API 4: Lấy danh sách rạp theo phim và tỉnh/thành phố
exports.getCinemasByMovieAndProvince = async (movieId, province) => {
    try {
        if (!movieId || !province) {
            throw new Error('Movie ID and province are required');
        }

        const movieObjectId = new mongoose.Types.ObjectId(movieId);
        
        const pipeline = [
            { 
                $match: { 
                    movieId: movieObjectId,
                    isDeleted: false,
                    startTime: { $gte: new Date() }
                } 
            },
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'roomId',
                    foreignField: '_id',
                    as: 'room'
                }
            },
            {
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
                $match: { 'cinema.province': province }
            },
            {
                $group: {
                    _id: '$cinema._id',
                    cinemaId: { $first: '$cinema._id' },
                    name: { $first: '$cinema.name' },
                    address: { $first: '$cinema.address' },
                    province: { $first: '$cinema.province' }
                }
            },
            {
                $project: {
                    _id: 0,
                    cinemaId: 1,
                    name: 1,
                    address: 1,
                    province: 1
                }
            },
            {
                $sort: { name: 1 }
            }
        ];

        return await showTimeModel.aggregate(pipeline);
    } catch (error) {
        console.error('Error getting cinemas by movie and province:', error);
        throw error;
    }
};

// API 5: Lấy danh sách ngày có suất chiếu theo phim và rạp
exports.getDatesByMovieAndCinema = async (movieId, cinemaId) => {
    try {
        if (!movieId || !cinemaId) {
            throw new Error('Movie ID and cinema ID are required');
        }

        const movieObjectId = new mongoose.Types.ObjectId(movieId);
        const cinemaObjectId = new mongoose.Types.ObjectId(cinemaId);
        
        const pipeline = [
            { 
                $match: { 
                    movieId: movieObjectId,
                    isDeleted: false,
                    // startTime: { $gte: new Date() }
                } 
            },
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'roomId',
                    foreignField: '_id',
                    as: 'room'
                }
            },
            {
                $match: {
                    'room.cinemaId': cinemaObjectId
                }
            },
            {
                $project: {
                    showDateOnly: {
                        $dateToString: { format: "%Y-%m-%d", date: "$showDate" }
                    }
                }
            },
            {
                $group: {
                    _id: "$showDateOnly",
                    date: { $first: "$showDateOnly" }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    _id: 0,
                    date: 1
                }
            },
            {
                $limit: 7 // Chỉ lấy 7 ngày sắp tới
            }
        ];

        return await showTimeModel.aggregate(pipeline);
    } catch (error) {
        console.error('Error getting dates by movie and cinema:', error);
        throw error;
    }
};

// API 6: Lấy danh sách suất chiếu theo phim, rạp và ngày
exports.getShowtimesByMovieCinemaAndDate = async (movieId, cinemaId, date) => {
    try {
        if (!movieId || !cinemaId || !date) {
            throw new Error('Movie ID, cinema ID and date are required');
        }

        const movieObjectId = new mongoose.Types.ObjectId(movieId);
        const cinemaObjectId = new mongoose.Types.ObjectId(cinemaId);
        
        const startOfDay = new Date(date);
        startOfDay.setHours(8, 30, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 0, 0, 0);

        const pipeline = [
            { 
                $match: { 
                    movieId: movieObjectId,
                    isDeleted: false,
                } 
            },
            {
                $addFields: {
                    showDateString: {
                        $dateToString: { format: "%Y-%m-%d", date: "$showDate" }
                    }
                }
            },
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'roomId',
                    foreignField: '_id',
                    as: 'room'
                }
            },
            {
                $match: {
                    'room.cinemaId': cinemaObjectId
                }
            },
            {
                $lookup: {
                    from: 'formats',
                    localField: 'formatId',
                    foreignField: '_id',
                    as: 'format'
                }
            },
            {
                $project: {
                    _id: 1,
                    startTime: 1,
                    endTime: 1,
                    roomId: 1,
                    'room.roomName': 1,
                    'format': { $arrayElemAt: ['$format', 0] }
                }
            },
            {
                $sort: { startTime: 1 }
            },
            {
                // Nhóm theo định dạng phim
                $group: {
                    _id: '$format._id',
                    formatName: { $first: '$format.name' },
                    showtimes: {
                        $push: {
                            _id: '$_id',
                            startTime: '$startTime',
                            endTime: '$endTime',
                            roomId: '$roomId',
                            roomName: { $arrayElemAt: ['$room.roomName', 0] }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    formatId: '$_id',
                    formatName: 1,
                    showtimes: 1
                }
            },
            {
                $sort: { formatName: 1 }
            }
        ];

        return await showTimeModel.aggregate(pipeline);
    } catch (error) {
        console.error('Error getting showtimes:', error);
        throw error;
    }
};

module.exports = exports;