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
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
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
 *                   example: Invalid input data
 *       401:
 *         description: Không có quyền truy cập
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
 *                   example: Unauthorized - Please login to access this resource
 *       404:
 *         description: Không tìm thấy tài nguyên
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
 *                   example: Movie/Room/Format not found
 *       409:
 *         description: Xung đột lịch chiếu
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
 *                   example: Showtime slot is already booked for this room
 *       500:
 *         description: Lỗi máy chủ
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
 *                   example: Internal server error
 */
router.post('/', showTimeController.createShowTime);

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
 *         description: Số trang (mặc định là 1)
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Số lượng item trên mỗi trang (mặc định là 6)
 *         example: 6
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sắp xếp theo trường (thêm dấu - để sắp xếp giảm dần)
 *         example: "-startTime"
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: Chọn các trường cần hiển thị (phân tách bằng dấu phẩy)
 *         example: "movieId,roomId,showDate,startTime"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Available, Occupied, Maintenance]
 *         description: Lọc theo trạng thái suất chiếu
 *         example: "Available"
 *       - in: query
 *         name: room
 *         schema:
 *           type: string
 *           enum: [Phòng 1, Phòng 2, Phòng 3, Phòng 4, Phòng 5]
 *         description: Lọc theo số phòng
 *         example: "Phòng 1"
 *     responses:
 *       200:
 *         description: Lấy danh sách suất chiếu thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: object
 *                   properties:
 *                     showtimes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "507f1f77bcf86cd799439011"
 *                           movieId:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "507f1f77bcf86cd799439012"
 *                               name:
 *                                 type: string
 *                                 example: "Avengers: Endgame"
 *                           roomId:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "507f1f77bcf86cd799439013"
 *                               roomName:
 *                                 type: string
 *                                 example: "Room A1"
 *                           formatId:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: "507f1f77bcf86cd799439014"
 *                               name:
 *                                 type: string
 *                                 example: "2D"
 *                           showDate:
 *                             type: string
 *                             format: date
 *                             example: "2024-04-20"
 *                           startTime:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-04-20T18:30:00.000Z"
 *                           status:
 *                             type: string
 *                             enum: [Available, Occupied, Maintenance]
 *                             example: "Available"
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
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
 *                   example: Invalid input data
 *       500:
 *         description: Lỗi máy chủ
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
 *                   example: Internal server error
 */
router.get('/', showTimeController.getAllShowTime);

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
router.get('/:id', showTimeController.getOneShowTimeById);

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
router.patch('/:id', showTimeController.updateShowTime);

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
 router.delete('/:id', showTimeController.deleteShowTime);
module.exports = router;