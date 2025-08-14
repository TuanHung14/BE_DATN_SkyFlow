const express = require('express');
const formatController = require('../controller/formatController');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

router.use(auth);

/**
 * @swagger
 * /api/v1/formats:
 *   get:
 *     tags:
 *       - Formats
 *     summary: Lấy danh sách định dạng
 *     operationId: getAllFormats
 *     security:
 *       - bearer: []
 *     responses:
 *       200:
 *         description: Lấy danh sách định dạng thành công
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/', formatController.getAllFormats);
router.post('/', formatController.createFormat);
router.patch('/:id', formatController.updateFormat);

module.exports = router;