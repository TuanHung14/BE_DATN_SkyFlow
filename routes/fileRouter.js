const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const {uploadFile} = require('../controller/fileController');

/**
 * @swagger
 * /api/v1/file/upload:
 *   post:
 *     tags:
 *       - File
 *     summary: Upload hình ảnh
 *     description: (Tối đa 10 ảnh, mỗi ảnh ≤ 5MB)
 *     operationId: uploadFile
 *     security:
 *       - bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Tải ảnh thành công
 *       400:
 *         description: Không có file nào được upload
 *       500:
 *         description: Lỗi khi upload ảnh lên Cloudinary
 */

router.use(auth, uploadMiddleware.array('images', 10));
router.post('/upload', uploadFile);

module.exports = router;