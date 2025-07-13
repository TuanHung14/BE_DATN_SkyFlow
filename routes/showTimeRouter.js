const express = require('express');
const showTimeController = require("../controller/showTimeController");
const auth = require("../middleware/authMiddleware");
const authorizer = require("../middleware/authorizeMiddleware");
const {Action, Resource} = require("../model/permissionModel");

const router = express.Router();

router.use(auth);

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
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy tài nguyên
 *       409:
 *         description: Xung đột lịch chiếu
 *       500:
 *         description: Lỗi máy chủ
 */

/**
 * @swagger
 * /api/v1/show-times:
 *   get:
 *     summary: Lấy danh sách tất cả suất chiếu
 *     tags: [Showtimes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Số trang
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Số lượng item trên mỗi trang
 *         example: 6
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sắp xếp theo trường
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Available, Occupied, Maintenance]
 *         description: Lọc theo trạng thái
 *       - in: query
 *         name: roomId
 *         schema:
 *           type: string
 *         description: Lọc theo ID phòng
 *         example: "682c3ca47bd1a298b7bcc3a8"
 *       - in: query
 *         name: cinemaId
 *         schema:
 *           type: string
 *         description: Lọc theo ID rạp
 *         example: "68293c98a16fbe5f854e5328"
 *     responses:
 *       200:
 *         description: Lấy danh sách suất chiếu thành công
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */

/**
 * @swagger
 * /api/v1/show-times/{id}:
 *   get:
 *     summary: Lấy thông tin một suất chiếu theo ID
 *     tags: [Showtimes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của suất chiếu
 *     responses:
 *       200:
 *         description: Thành công
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
 *                           example: "507f1f77bcf86cd799439011"
 *                         movieId:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "507f1f77bcf86cd799439012"
 *                             name:
 *                               type: string
 *                               example: "Avengers: Endgame"
 *                         roomId:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "507f1f77bcf86cd799439013"
 *                             roomName:
 *                               type: string
 *                               example: "Room A1"
 *                         showDate:
 *                           type: string
 *                           format: date
 *                           example: "2024-04-20"
 *                         startTime:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-04-20T18:30:00.000Z"
 *                         status:
 *                           type: string
 *                           example: "Available"
 *       404:
 *         description: Không tìm thấy suất chiếu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: No showtime found with that ID
 */

/**
 * @swagger
 * /api/v1/show-times/{id}:
 *   patch:
 *     summary: Cập nhật thông tin suất chiếu
 *     tags: [Showtimes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của suất chiếu
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movieId:
 *                 type: string
 *                 example: "682c3ca47bd1a298b7bcc3a8"
 *               roomId:
 *                 type: string
 *                 example: "682aeacf83153ed5450fead5"
 *               formatId:
 *                 type: string
 *                 example: "682abe49ab5bb018690c1219"
 *               showDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-04-20"
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-04-20T18:30:00.000Z"
 *               status:
 *                 type: string
 *                 enum: [Available, Occupied, Maintenance]
 *                 example: "Maintenance"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
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
 *       404:
 *         description: Không tìm thấy suất chiếu
 */

 /**
  * @swagger
 * /api/v1/show-times/{id}:
 *   delete:
 *     summary: Xóa mềm suất chiếu
 *     tags: [Showtimes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của suất chiếu
 *     responses:
 *       200:
 *         description: Xóa mềm thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Showtime has been deleted successfully
 *       404:
 *         description: Không tìm thấy suất chiếu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: No showtime found with that ID
 */

 router.route('/')
     .get(showTimeController.getAllShowTime)
     .post(authorizer(`${Action.Create}_${Resource.ShowTime}`),showTimeController.createShowTime);

 router.route('/:id')
     .get(showTimeController.getOneShowTimeById)
     .patch(authorizer(`${Action.Update}_${Resource.ShowTime}`),showTimeController.updateShowTime)
     .delete(authorizer(`${Action.Delete}_${Resource.ShowTime}`),showTimeController.deleteShowTime);

module.exports = router;