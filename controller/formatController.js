const format = require('../model/formatModel');
const Factory = require("./handleFactory");

exports.getAllFormats = Factory.getAll(format);