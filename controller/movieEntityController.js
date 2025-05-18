const movieEntityModel = require('../model/movieEntityModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handleFactory');
const APIFeatures = require('../utils/apiFeatures');

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

// LẤY TẤT CẢ THỰC THỂ CHO BÊN NGƯỜI DÙNG
exports.getAllMovieEntities = catchAsync(async (req, res, next) => {
    const filter = { isDeleted: false };

    const features = new APIFeatures(movieEntityModel.find(filter), req.query).filter().sort().limitFields().pagination();

    const doc = await features.query;

    if (!doc) {
        return next(new AppError('Không tìm thấy dữ liệu', 404));
    }

    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            data: doc
        }
    });
})

// XOÁ MỀM THỰC THỂ CHỈ LÀ THAY ĐỔI FIELD idDelete thành true để ẩn bên người dùng
exports.deleteMovieEntity = catchAsync(async (req, res, next) => {
    const doc = await movieEntityModel.findByIdAndUpdate(
        req.params.id,
        {
            isDeleted: true,
            deletedAt: Date.now()
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!doc) {
        return next(new AppError('Không có thực thể với id này.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });
})

// Khôi phục lại thực thể bị xoá mềm
exports.restoreMovieEntity = catchAsync(async (req, res, next) => {
    const doc = await movieEntityModel.findByIdAndUpdate(
        req.params.id,
        {
            isDeleted: false,
            deletedAt: null
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!doc) {
        return next(new AppError(`Không có thực thể với id này.`, 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });
})

exports.createMovieEntity = Factory.createOne(movieEntityModel);
exports.getMovieEntityById = Factory.getOne(movieEntityModel);
exports.getAllMovieEntitiesAdmin = Factory.getAll(movieEntityModel);
exports.updateMovieEntity = Factory.updateOne(movieEntityModel);