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
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        type: type,
        isDeleted: false
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
        return next(new AppError(errorMessage, 400))
    }


    next();

});

// LẤY TẤT CẢ THỰC THỂ CHO BÊN ADMIN
// exports.getAllMovieEntitiesAdmin = catchAsync(async (req, res, next) => {
//     const filter = {};
//
//     const features = new APIFeatures(movieEntityModel.find(filter), req.query).filter().sort().limitFields().pagination();
//
//     const doc = await features.query;
//
//     if (!doc) {
//         return next(new AppError('Không tìm thấy dữ liệu', 404));
//     }
//
//     res.status(200).json({
//         status: 'success',
//         results: doc.length,
//         data: {
//             data: doc
//         }
//     });
// })

exports.createMovieEntity = Factory.createOne(movieEntityModel);
exports.getMovieEntityById = Factory.getOne(movieEntityModel);
exports.getAllMovieEntities = Factory.getAll(movieEntityModel);
exports.updateMovieEntity = Factory.updateOne(movieEntityModel);
exports.deleteMovieEntity = Factory.softDeleteOne(movieEntityModel);