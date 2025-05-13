const movieEntityModel = require('../model/movieEntityModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handleFactory');
const movieEntityService = require('../services/movieEntityService');

exports.createMovieEntity = async (req, res) => {
    try {
        const movieEntity = await movieEntityService.createMovieEntity(req.body);
        res.status(201).json({
            message: 'Tạo thực thể thành công',
            data: movieEntity,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getAllMovieEntities = async (req, res) => {
    try {
        const movieEntities = await movieEntityService.getAllMovieEntities();
        res.status(200).json({
            message: 'Lấy danh sách thực thể thành công',
            data: movieEntities,
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getMovieEntityById = async (req, res) => {
    try {
        const movieEntity = await movieEntityService.getMovieEntityById(req.params.id);
        res.status(200).json({
            message: 'Lấy thực thể thành công',
            data: movieEntity,
        });
    } catch (err) {
        res.status(err.message === 'Không tìm thấy thực thể' ? 404 : 500).json({ message: err.message });
    }
};

exports.updateMovieEntity = async (req, res) => {
    try {
        const movieEntity = await movieEntityService.updateMovieEntity(req.params.id, req.body);
        res.status(200).json({
            message: 'Cập nhật thực thể thành công',
            data: movieEntity,
        });
    } catch (err) {
        res.status(err.message === 'Không tìm thấy thực thể' ? 404 : 400).json({ message: err.message });
    }
};

exports.deleteMovieEntity = async (req, res) => {
    try {
        await movieEntityService.deleteMovieEntity(req.params.id);
        res.status(200).json({ message: 'Xóa thực thể thành công' });
    } catch (err) {
        res.status(err.message === 'Không tìm thấy thực thể' ? 404 : 500).json({ message: err.message });
    }
};

exports.createMovieEntity = Factory.createOne(movieEntityModel);
exports.getAllMovieEntities = Factory.getAll(movieEntityModel);
exports.getMovieEntityById = Factory.getAll(movieEntityModel);
exports.updateMovieEntity = Factory.updateOne(movieEntityModel);
exports.deleteMovieEntity = Factory.deleteOne(movieEntityModel);