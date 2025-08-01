const express = require('express');
const levelController = require('../controller/levelController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/v1/levels:
 *   get:
 *     tags:
 *       - Levels
 *     summary: Lấy danh sách cấp độ (client)
 *     operationId: getLevelsForClient
 *     responses:
 *       200:
 *         description: Trả về danh sách cấp độ cho client
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/', levelController.getFieldGetClient, levelController.getAllLevels)

router.use(auth);

/**
 * @swagger
 * /api/v1/levels/toggle/{id}:
 *   put:
 *     tags:
 *       - Levels
 *     summary: Bật/tắt trạng thái isDefault của cấp độ
 *     operationId: toggleIsDefault
 *     security:
 *       - bearer: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của cấp độ
 *     responses:
 *       200:
 *         description: Đã cập nhật trạng thái isDefault thành công
 *       404:
 *         description: Không tìm thấy cấp độ
 *       500:
 *         description: Lỗi máy chủ
 */
router.put('/toggle/:id', levelController.toggleIsDefault);

/**
 * @swagger
 * /api/v1/levels/admin:
 *   get:
 *     tags:
 *       - Levels
 *     summary: Lấy tất cả cấp độ (admin)
 *     operationId: getAllLevelsAdmin
 *     security:
 *       - bearer: []
 *     responses:
 *       200:
 *         description: Trả về danh sách cấp độ
 *       500:
 *         description: Lỗi máy chủ
 */

/**
 * @swagger
 * /api/v1/levels/admin:
 *   post:
 *     tags:
 *       - Levels
 *     summary: Tạo cấp độ mới
 *     operationId: createLevel
 *     security:
 *       - bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - icon
 *               - minXp
 *               - pointMultiplier
 *             properties:
 *               name:
 *                 type: string
 *                 example: Level 1
 *               icon:
 *                 type: string
 *                 example: string
 *               minXp:
 *                 type: number
 *                 example: 0
 *               pointMultiplier:
 *                 type: number
 *                 example: 1
 *               voucherId:
 *                 type: string
 *                 example: 64ecf7d123456789abcdef12
 *               active:
 *                 type: boolean
 *                 example: true
 *               isDefault:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Tạo cấp độ thành công
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc bị thiếu
 *       500:
 *         description: Lỗi máy chủ
 */


router.route('/admin')
    .get(levelController.getAllLevels)
    .post(levelController.createLevel);

/**
 * @swagger
 * /api/v1/levels/{id}:
 *   get:
 *     tags:
 *       - Levels
 *     summary: Lấy thông tin cấp độ theo ID
 *     operationId: getLevelById
 *     security:
 *       - bearer: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của cấp độ
 *     responses:
 *       200:
 *         description: Trả về thông tin cấp độ
 *       404:
 *         description: Không tìm thấy cấp độ
 *       500:
 *         description: Lỗi máy chủ
 */

/**
 * @swagger
 * /api/v1/levels/{id}:
 *   patch:
 *     tags:
 *       - Levels
 *     summary: Cập nhật thông tin cấp độ
 *     operationId: updateLevel
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của cấp độ cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Level VIP
 *               icon:
 *                 type: string
 *                 example: string
 *               minXp:
 *                 type: number
 *                 example: 1000
 *               pointMultiplier:
 *                 type: number
 *                 example: 2
 *               voucherId:
 *                 type: string
 *                 example: 64ecf7d123456789abcdef12
 *               active:
 *                 type: boolean
 *                 example: true
 *               isDefault:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy cấp độ
 *       500:
 *         description: Lỗi máy chủ
 */


router.route('/:id')
    .get(levelController.getLevelById)
    .patch(levelController.updateLevel)

module.exports = router;

