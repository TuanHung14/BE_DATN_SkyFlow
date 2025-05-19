const express = require('express');
const showTimeController = require("../controller/showTimeController");
const {auth} = require("../middleware/authMiddleware");

const router = express.Router();

// router.use(auth);

/**
 * @swagger
 * /api/v1/show-times:
 *   post:
 *     summary: Tạo một suất chiếu mới
 *     tags: [Showtimes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movieId
 *               - roomId
 *               - formatId
 *               - showDate
 *               - startTime
 *             properties:
 *               movieId:
 *                 type: string
 *                 format: uuid
 *                 description: ID của bộ phim
 *                 example: "507f1f77bcf86cd799439011"
 *               roomId:
 *                 type: string
 *                 format: uuid
 *                 description: ID của phòng chiếu
 *                 example: "507f1f77bcf86cd799439012"
 *               formatId:
 *                 type: string
 *                 format: uuid
 *                 description: ID của định dạng phim (2D, 3D, IMAX, 4DX)
 *                 example: "507f1f77bcf86cd799439014"
 *               showDate:
 *                 type: string
 *                 format: date
 *                 description: Ngày chiếu (YYYY-MM-DD)
 *                 example: "2024-04-20"
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Thời gian bắt đầu suất chiếu
 *                 example: "2024-04-20T18:30:00.000Z"
 *               status:
 *                 type: string
 *                 enum: [Available, Occupied, Maintenance]
 *                 description: Trạng thái của suất chiếu
 *                 default: Available
 *                 example: "Available"
 *     responses:
 *       201:
 *         description: Tạo suất chiếu thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     showtime:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         movieId:
 *                           type: object
 *                           properties:
 *                             _id: 
 *                               type: string
 *                             name:
 *                               type: string
 *                         roomId:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             roomName:
 *                               type: string
 *                         formatId:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             name:
 *                               type: string
 *                         showDate:
 *                           type: string
 *                           format: date
 *                         startTime:
 *                           type: string
 *                           format: date-time
 *                         status:
 *                           type: string
 */
router.post('/', showTimeController.createShowTime);

module.exports = router;