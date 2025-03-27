const cloudinary = require('../config/cloudinary');
const AppError = require("./appError");

const uploadToCloudinary = async (filePath) => {
    const result = await cloudinary.uploader.upload(filePath);
    return {
        url: result.url,
        publicId: result.public_id
    };
}

module.exports = {
    uploadToCloudinary
}