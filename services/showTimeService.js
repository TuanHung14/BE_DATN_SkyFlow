const mongoose = require('mongoose');
const showTimeModel = require('../model/showtimeModel');

const createFilter = (params) => {
    const {date, province ,cinemaId} = params;
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
}

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
                        'room.cinema': cinemaObjectId
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
                    localField: 'format',
                    foreignField: '_id',
                    as: 'format'
                }
            },
            {
                $lookup: {
                    from: 'cinemas',
                    localField: 'room.cinema',
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
        const results = await showTimeModel.aggregate(pipeline);
        return results;
    } catch (error) {
        console.log(error);
    }



    return showTimeModel.aggregate(pipeline);
};
