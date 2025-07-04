const express = require('express');
const auth = require('../middleware/authMiddleware');
const roomController = require('../controller/roomController');
const router = express.Router();

router.use(auth);

/**
 * @swagger
 * /api/v1/rooms:
 *   get:
 *     tags:
 *       - Rooms
 *     summary: Lấy danh sách tất cả phòng chiếu
 *     operationId: getAllRooms
 *     security:
 *       - bearer: []
 *     responses:
 *       200:
 *         description: Thành công, trả về danh sách phòng
 *       500:
 *         description: Lỗi máy chủ
 *   post:
 *     tags:
 *       - Rooms
 *     summary: Tạo phòng chiếu mới
 *     operationId: createRoom
 *     security:
 *       - bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - room_name
 *             properties:
 *               cinemaId:
 *                 type: string
 *                 example: 68293c98a16fbe5f854e5328
 *               roomName:
 *                 type: string
 *                 example: room 1
 *               formats:
 *                 type: [string]
 *                 example: [682abe49ab5bb018690c121a,682abe49ab5bb018690c1219]
 *               status:
 *                 type: string
 *                 example: active
 *     responses:
 *       201:
 *         description: Tạo phòng chiếu thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.route('/').get(roomController.getAllRooms).post(roomController.createRoom);

/**
 * @swagger
 * /api/v1/rooms/{id}:
 *   get:
 *     tags:
 *       - Rooms
 *     summary: Lấy thông tin một phòng chiếu
 *     operationId: getRoom
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID phòng chiếu
 *     responses:
 *       200:
 *         description: Thành công, trả về thông tin phòng
 *       404:
 *         description: Không tìm thấy phòng chiếu
 *       500:
 *         description: Lỗi máy chủ
 *   patch:
 *     tags:
 *       - Rooms
 *     summary: Cập nhật thông tin phòng chiếu
 *     operationId: updateRoom
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID phòng chiếu
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cinemaId:
 *                 type: string
 *                 example: 68293c98a16fbe5f854e5328
 *               roomName:
 *                 type: string
 *                 example: room 1
 *               formats:
 *                 type: [string]
 *                 example: [682abe49ab5bb018690c121a,682abe49ab5bb018690c1219]
 *               status:
 *                 type: string
 *                 example: active
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy phòng
 *       500:
 *         description: Lỗi máy chủ
 *   delete:
 *     tags:
 *       - Rooms
 *     summary: Xóa phòng chiếu
 *     operationId: deleteRoom
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID phòng chiếu
 *     responses:
 *       204:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy phòng
 *       500:
 *         description: Lỗi máy chủ
 */
router.route('/:id').get(roomController.getRoom).patch(roomController.getFieldRoom,roomController.updateRoom).delete(roomController.deleteRoom);

module.exports = router;