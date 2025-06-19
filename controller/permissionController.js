const Factory = require("./handleFactory");
const { Permission} = require("../model/permissionModel");


exports.getAllPermission = Factory.getAll(Permission);