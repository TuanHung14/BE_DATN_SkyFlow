const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {uploadToCloudinary} = require('../utils/cloudinary');

const uploadFile = catchAsync(async (req, res, next) => {
    if(!req.files){
        return next(new AppError('No file uploaded', 400));
    }

    const images = req.files.map((file) => file.path);
    const uploadImages = [];

    for (let image of images) {
        try {
            const {url, publicId} = await uploadToCloudinary(image);
            uploadImages.push({url, publicId});
        } catch (error) {
            return next(new AppError('Error uploading to Cloudinary', 500));
        }
    }

    res.status(201).json({
        status:'success',
        message: 'File uploaded successfully',
        data: uploadImages
    });
})

module.exports = {
    uploadFile
}