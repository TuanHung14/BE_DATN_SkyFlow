const movieEntityModel = require('../model/movieEntityModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handleFactory');

exports.checkDuplicateName = catchAsync(async (req, res, next) => {
    const { name, type } = req.body;

    // kiểm tra có thuộc một trong các type cần check không
    const validTypes = ['genre', 'cast', 'director'];
    if (!validTypes.includes(type)) {
        return next(new AppError('Nhập đúng type là genre, cast, director', 400));
    }

    // tìm kiếm entity có cùng tên và type
    const existingEntity = await movieEntityModel.findOne({
        name: name,
        type: type
    });

    if (existingEntity) {
        let errorMessage;
        switch (type) {
            case 'genre':
                errorMessage = 'Thể loại này đã tồn tại';
                break;
            case 'director':
                errorMessage = 'Đạo diễn này đã tồn tại';
                break;
            case 'cast':
                errorMessage = 'Diễn viên này đã tồn tại';
                break;
        }
        return next(new AppError(errorMessage, 400));
    }

    next();

});

exports.createMovieEntity = Factory.createOne(movieEntityModel);
exports.getMovieEntityById = Factory.getOne(movieEntityModel);
exports.getAllMovieEntities = Factory.getAll(movieEntityModel);
exports.updateMovieEntity = Factory.updateOne(movieEntityModel);
exports.deleteMovieEntity = Factory.deleteOne(movieEntityModel);