const format = require('../model/formatModel');
const Factory = require("./handleFactory");

exports.getAllFormats = Factory.getAll(format);
exports.createFormat = Factory.createOne(format);
exports.updateFormat = Factory.updateOne(format);