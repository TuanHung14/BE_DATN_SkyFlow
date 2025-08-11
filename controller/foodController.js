const Factory = require("./handleFactory");
const Food = require("../model/foodModel");

exports.getFieldGetClient = (req, res, next) => {
    req.query.status = 'active';
    next();
}

exports.getAllFoods = Factory.getAll(Food);
exports.getFoodById = Factory.getOne(Food);
exports.createFood = Factory.createOne(Food);
exports.updateFood = Factory.updateOne(Food);
exports.deleteFood = Factory.softDeleteOne(Food);
