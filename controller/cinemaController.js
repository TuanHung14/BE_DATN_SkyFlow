const Cinema = require('../model/cinemaModel');
const Factory = require("./handleFactory");

exports.createCinema = Factory.createOne(Cinema);

exports.getAllCinemas = Factory.getAll(Cinema);

exports.getOneCinema = Factory.getOne(Cinema);

exports.updateCinema = Factory.updateOne(Cinema);

exports.deleteCinema = Factory.softDeleteOne(Cinema);