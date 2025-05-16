const movieEntityModel = require('../model/movieEntityModel');
const Factory = require('./handleFactory');

exports.createMovieEntity = Factory.createOne(movieEntityModel);
exports.getMovieEntityById = Factory.getOne(movieEntityModel);
exports.getAllMovieEntities = Factory.getAll(movieEntityModel);
exports.updateMovieEntity = Factory.updateOne(movieEntityModel);
exports.deleteMovieEntity = Factory.deleteOne(movieEntityModel);