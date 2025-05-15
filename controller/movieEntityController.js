const movieEntityModel = require('../model/movieEntityModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handleFactory');
const movieEntityService = require('../services/movieEntityService');

exports.createMovieEntity = catchAsync(async (req, res, next) => {
    const movieEntity = await movieEntityService.createMovieEntity(req.body);
    res.status(201).json({
        message: 'Tạo thực thể thành công',
        data: movieEntity,
    });
});

exports.getAllMovieEntities = catchAsync(async (req, res, next) => {
    const movieEntities = await movieEntityService.getAllMovieEntities();
    res.status(200).json({
        message: 'Lấy danh sách thực thể thành công',
        data: movieEntities,
    });
});

exports.getMovieEntityById = catchAsync(async (req, res, next) => {
    const movieEntity = await movieEntityService.getMovieEntityById(req.params.id);
    
    if (!movieEntity) {
        return next(new AppError('Không tìm thấy thực thể', 404));
    }
    
    res.status(200).json({
        message: 'Lấy thực thể thành công',
        data: movieEntity,
    });
});

exports.updateMovieEntity = catchAsync(async (req, res, next) => {
    const movieEntity = await movieEntityService.updateMovieEntity(req.params.id, req.body);
    
    if (!movieEntity) {
        return next(new AppError('Không tìm thấy thực thể', 404));
    }
    
    res.status(200).json({
        message: 'Cập nhật thực thể thành công',
        data: movieEntity,
    });
});

exports.deleteMovieEntity = catchAsync(async (req, res, next) => {
    const movieEntity = await movieEntityService.deleteMovieEntity(req.params.id);
    
    if (!movieEntity) {
        return next(new AppError('Không tìm thấy thực thể', 404));
    }
    
    res.status(200).json({ message: 'Xóa thực thể thành công' });
});