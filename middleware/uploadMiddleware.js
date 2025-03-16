const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');


const storage = new CloudinaryStorage(
    {
        cloudinary: cloudinary,
        params: {
            folder: 'public/images',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'],
            // transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
          }
    }
)

const checkFileFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
}

module.exports = multer({
    storage,
    fileFilter: checkFileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } //5MB
})