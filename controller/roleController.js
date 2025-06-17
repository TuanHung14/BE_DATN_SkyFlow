const Role = require("../model/roleModel");
const Factory = require("./handleFactory");

exports.createRole = Factory.createOne(Role);
exports.updateRole = Factory.updateOne(Role);
exports.findAllRole = Factory.getAll(Role);
exports.findOneRole = Factory.getOne(Role);