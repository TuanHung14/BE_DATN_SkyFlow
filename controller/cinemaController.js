const Cinema = require('../model/cinemaModel');
const Factory = require('./handleFactory');
const catchAsync = require('../utils/catchAsync');
const { ObjectId } = require('mongoose').Types;

exports.createCinema = Factory.createOne(Cinema);

exports.getAllCinemas = Factory.getAll(Cinema);

exports.getOneCinema = Factory.getOne(Cinema);

exports.updateCinema = Factory.updateOne(Cinema);

exports.deleteCinema = Factory.softDeleteOne(Cinema);

exports.getFilteredCinemas = catchAsync(async (req, res, next) => {
    const { province, date, movieId } = req.query;

    const cinemaMatch = { isDeleted: false };
    if (province) {
        cinemaMatch.province = province;
    }

    const showtimeConditions = [
        { $eq: ['$isDeleted', false] }
    ];
    if (movieId) {
        showtimeConditions.push({ $eq: ['$movieId', new ObjectId(movieId)] });
    }
    if (date) {
        showtimeConditions.push({ $eq: ['$showDate', new Date(date)] });
    }

    const pipeline = [
        // 1. Lọc rạp chiếu phim
        { $match: cinemaMatch },

        // 2. Lấy danh sách phòng thuộc rạp
        {
            $lookup: {
                from: 'rooms',
                localField: '_id',
                foreignField: 'cinemaId',
                as: 'rooms'
            }
        },

        // 3. Lấy ID của các phòng không bị xóa
        {
            $addFields: {
                roomIds: {
                    $map: {
                        input: {
                            $filter: {
                                input: '$rooms',
                                as: 'room',
                                cond: { $eq: ['$$room.isDeleted', false] }
                            }
                        },
                        as: 'room',
                        in: '$$room._id'
                    }
                }
            }
        },

        // 4. Lấy suất chiếu tương ứng với các phòng
        {
            $lookup: {
                from: 'showtimes',
                let: { roomIds: '$roomIds' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $in: ['$roomId', '$$roomIds'] },
                                    ...showtimeConditions
                                ]
                            }
                        }
                    }
                ],
                as: 'showtimes'
            }
        },

        // 5. Chỉ giữ lại các rạp có ít nhất một suất chiếu
        {
            $match: {
                'showtimes.0': { $exists: true }
            }
        },

        // 6. Định dạng kết quả: thông tin rạp và mảng thời gian
        {
            $project: {
                cinema: {
                    _id: '$_id',
                    name: '$name',
                    province: '$province',
                },
                times: '$showtimes.startTime'
            }
        }
    ];

    const data = await Cinema.aggregate(pipeline);

    res.status(200).json({
        status: 'success',
        results: data.length,
        data: data
    });
});

exports.getNearestCinemas = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { unit } = req.params;
    // unit có thể là 'mi' (dặm) hoặc 'km' (kilomet)
    const multiplier = unit ==='mi'? 0.000621371 : 0.001;
    let cinemas;

    if (!user || user.location.coordinates[0] === 0 || user.location.coordinates[1] === 0) {
        cinemas = await Cinema.find(
            {
                isDeleted: false
            },
            {
                name: 1,
                province: 1,
                district: 1,
                ward: 1,
                address: 1,
                phone: 1
        })
            .sort({ createdAt: -1 })
            .limit(4);

        return res.status(200).json({
            status: 'success',
            data: {
                cinemas
            }
        });
    }

    const [latitude, longitude] = user.location.coordinates;

    cinemas = await Cinema.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [latitude * 1, longitude * 1],
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier,
                query: { isDeleted: false }
            }
        },
        {
            $limit: 4
        },
        {
            $project: {
                name: 1,
                province: 1,
                district: 1,
                ward: 1,
                address: 1,
                phone: 1,
                distance: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            cinemas
        }
    });
});
