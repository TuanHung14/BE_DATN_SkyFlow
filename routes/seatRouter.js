const express = require('express');
const seatController = require('../controller/seatController');
const router = express.Router();


/**
 * @swagger
 * /api/v1/seats/{showtimeId}:
 *   get:
 *     tags:
 *       - Seats
 *     summary: Lấy danh sách ghế theo phòng chiếu (sau khi chọn showtime thì có id của showtime -> có id của room)
 *     operationId: getAllSeat
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: showtimeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của suất chiếu (showtime) để lấy danh sách ghế
 *     responses:
 *       200:
 *         description: Lấy danh sách ghế thành công
 *       400:
 *         description: Thiếu hoặc sai roomId
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/:showtimeId", seatController.getAllSeat);

router.post("/", seatController.createSeat);

router.get('/edit/:roomid', seatController.getAllSeatByRoom);

router.patch("/edit", seatController.updateSeat);

module.exports = router;