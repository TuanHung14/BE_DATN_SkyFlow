const Room = require('../model/roomModel');
const Factory = require("./handleFactory");
const { filterObj } = require('../utils/helper');

exports.getFieldRoom = (req, res, next) => {
    req.body = filterObj(req.body, 'cinemaId', 'roomName', 'formats', 'status');
    next();
}

exports.getAllRooms = Factory.getAll(Room, 'cinemaId formats');
exports.getRoom = Factory.getOne(Room, 'cinemaId formats');
exports.createRoom = Factory.createOne(Room);
exports.updateRoom = Factory.updateOne(Room);
exports.deleteRoom = Factory.softDeleteOne(Room);