const express = require('express');
const seatController = require('../controller/seatController');
const router = express.Router();


/**
 * @swagger
 * /api/v1/seats:
 *   get:
 *     tags:
 *       - Seats
 *     summary: Lấy danh sách ghế theo phòng chiếu (sau khi chọn showtime thì có id của showtime -> có id của room)
 *     operationId: getAllSeat
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: query
 *         name: showtimeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của suất chiếu (showtime) để lấy danh sách ghế
 *     responses:
 *       200:
 *         description: Lấy danh sách ghế thành công
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               results: 40
 *               data:
 *                 - _id: "665e123abc..."
 *                   seatNumber: "A1"
 *                   seatType: "Standard"
 *                   roomId: "665eaaa..."
 *                 - _id: "665e124abc..."
 *                   seatNumber: "A2"
 *                   seatType: "VIP"
 *                   roomId: "665eaaa..."
 *       400:
 *         description: Thiếu hoặc sai roomId
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/", seatController.getAllSeat);
router.post("/", seatController.createSeat);
router.patch("/edit", seatController.updateSeat);

module.exports = router;