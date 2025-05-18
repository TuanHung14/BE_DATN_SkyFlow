const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');


exports.getAll = Model => catchAsync(async (req, res, next) => {

    const filter = Model.schema.path('isDeleted') ? { isDeleted: false } : {};
    // Sau này dùng cho phần đánh giá nên comment để đây
    // if(req.params.tourId) filter.tour = req.params.tourId;
    
    const features = new APIFeatures(Model.find(filter), req.query).filter().search().sort().limitFields().pagination();
    const doc = await features.query;


    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            data: doc
        }
    });
});

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    let query = await Model.findOne({_id:req.params.id});
    if(popOptions) query = query.populate(popOptions);
    const doc = await query;
    if(!doc) {
        return next(new AppError(`No document found with that id`), 404);
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
        status:'success',
        data: {
            data: doc
        }
    })
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if(!doc) {
        return next(new AppError(`No document found with that id`), 404);
    }
    res.status(200).json({
        status:'success',
        data: {
           data:  doc
        }
    })
});

exports.deleteOne = Model => catchAsync(async (req, res, next) => { 
    const doc = await Model.findByIdAndDelete(req.params.id);

    if(!doc) {
        return next(new AppError(`No document found with that id`), 404);
    }

    res.status(200).json({
        status:'success',
        data: null
    })
});

exports.softDeleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, {
        isDeleted: true
    })

    if(!doc){
        return next(new AppError(`Không tìm thấy dữ liệu theo id này: ${req.params.id}`), 404);
    }

    res.status(200).json({
        status: 'success',
        message: 'Dữ liệu xóa thành công',
        data: null
    })
})




