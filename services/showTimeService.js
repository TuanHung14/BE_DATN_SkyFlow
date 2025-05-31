const mongoose = require('mongoose');
const showTimeModel = require('../model/showtimeModel');
const APIFeatures = require('../utils/apiFeatures');
const roomModel = require('../model/roomModel');
const movieModel = require("../model/movieModel");
const cinemaModel = require("../model/cinemaModel");

// Tạo filter cơ bản
exports.createFilter = async (options) => {
    const {date, province, cinemaId} = options;
    const filter = {isDeleted: false};

    if (date) {
        const selectedDate = new Date(date);

        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(8, 30, 0, 0);

        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 0, 0, 0);

        filter.startTime = {
            $gte: startOfDay,
            $lte: endOfDay
        };
    }

    if (cinemaId && mongoose.isValidObjectId(cinemaId)) {
        const rooms = await roomModel.find({ cinemaId: cinemaId });
        const roomIds = rooms.map(room => room._id);
        filter.roomId = { $in: roomIds };
    }

    if (province) {
        const cinemas = await cinemaModel.find({ province: province });
        const cinemaIds = cinemas.map(cinema => cinema._id);

        const rooms = await roomModel.find({ cinemaId: { $in: cinemaIds } });
        const roomIds = rooms.map(room => room._id);

        if (filter.roomId) {
            const existingRoomIds = filter.roomId.$in;
            const combinedRoomIds = existingRoomIds.filter(id =>
                roomIds.some(roomId => roomId.equals(id))
            );
            filter.roomId = { $in: combinedRoomIds };
        } else {
            filter.roomId = { $in: roomIds };
        }
    }

    return filter;
};

// Lấy danh sách showtime với filter
exports.getShowtimes = async (options) => {
    const filter = await this.createFilter(options);

    const showtimes = await showTimeModel.find(filter)
        .populate({
            path: 'movieId',
            select: 'name poster duration description'
        })
        .populate({
            path: 'roomId',
            select: 'roomName capacity cinemaId',
            populate: {
                path: 'cinemaId',
                select: 'name province'
            }
        })
        .populate({
            path: 'formatId',
            select: 'name'
        })
        .sort({ startTime: 1 });

    return showtimes;
};

exports.getAllShowTimes = async (queryParams) => {
    const queryParamsCopy = { ...queryParams };

    console.log(queryParamsCopy);

    let filter = showTimeModel.schema.path("isDeleted") ? { isDeleted: false } : {};

    if (queryParams.cinemaId) {
        console.log(queryParamsCopy.cinemaId);

        let cinemaObjectId = queryParamsCopy.cinemaId;

        const roomsInCinema = await roomModel.find({ cinemaId: cinemaObjectId }).select('_id');
        console.log(roomsInCinema.length);

        if (roomsInCinema && roomsInCinema.length > 0) {
            const roomIds = roomsInCinema.map(room => room._id);
            filter.roomId = { $in: roomIds };
        } else {
            return {
                totalResults: 0,
                data: []
            };
        }

        delete queryParamsCopy.cinemaId;
    }

    if (queryParamsCopy.name) {
        const searchTerm = queryParamsCopy.name?.trim();

        console.log(searchTerm);

        const movies = await movieModel.find({
            name: { $regex: searchTerm, $options: 'i' }
        }).select('_id');

        if (movies && movies.length > 0) {
            const movieIds = movies.map(movie => movie._id);
            filter.movieId = filter.movieId
                ? { $in: movieIds.filter(id => filter.movieId.$in.includes(id)) }
                : { $in: movieIds };
        } else {
            return {
                totalResults: 0,
                data: []
            };
        }
        delete queryParamsCopy.name;
    }

    const totalResults = await showTimeModel.countDocuments(filter);

    let query = showTimeModel.find(filter).populate([
        {
            path: 'movieId',
            select: 'name posterUrl duration'
        },
        {
            path: 'roomId',
            select: 'roomName capacity',
            populate: {
                path: 'cinemaId',
                select: 'name province'
            }
        },
        {
            path: 'formatId',
            select: 'name'
        }
    ]);

    const features = new APIFeatures(query, queryParamsCopy)
        .filter()
        .sort()
        .limitFields()
        .pagination();

    const results = await features.query;

    return {
        totalResults: totalResults,
        data: results
    };
};

module.exports = exports;