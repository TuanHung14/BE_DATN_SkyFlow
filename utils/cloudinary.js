const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath);
        return {
            url: result.url,
            publicId: result.public_id
        };
    } catch (error) {
        console.error(error);
        throw new Error('Failed to upload image to cloudinary');
    }
}

module.exports = {
    uploadToCloudinary
}