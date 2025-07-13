const express = require('express');
const seatController = require('../controller/seatController');
const auth = require('../middleware/authMiddleware');
const authorize = require("../middleware/authorizeMiddleware");
const {Action, Resource} = require("../model/permissionModel");
const router = express.Router();

router.use(auth);

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

router.post("/", authorize(`${Action.Create}_${Resource.Seat}`), seatController.createSeat);

router.get('/edit/:id', authorize(`${Action.Read}_${Resource.Seat}`), seatController.getAllSeatByRoom);

router.patch("/edit", authorize(`${Action.Update}_${Resource.Seat}`),seatController.updateSeat);

module.exports = router;