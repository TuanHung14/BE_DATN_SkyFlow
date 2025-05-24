const express = require('express');
const showTimeController = require("../controller/showTimeController");
const {auth} = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/v1/show-times/filter:
 *   get:
 *     summary: Lấy danh sách suất chiếu theo bộ lọc
 *     tags: [Showtimes]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày chiếu (YYYY-MM-DD)
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *         description: Tỉnh/thành phố
 *       - in: query
 *         name: cinemaId
 *         schema:
 *           type: string
 *         description: ID của rạp chiếu phim
 *     responses:
 *       200:
 *         description: Danh sách suất chiếu theo bộ lọc
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 *
 * /api/v1/show-times/cinemas/{cinemaId}/dates:
 *   get:
 *     summary: Lấy danh sách các ngày có suất chiếu của một rạp
 *     tags: [Showtimes]
 *     parameters:
 *       - in: path
 *         name: cinemaId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của rạp chiếu phim
 *     responses:
 *       200:
 *         description: Danh sách các ngày có suất chiếu
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 *
 * /api/v1/show-times/cinemas/{cinemaId}/dates/{date}:
 *   get:
 *     summary: Lấy danh sách suất chiếu theo ngày của một rạp
 *     tags: [Showtimes]
 *     parameters:
 *       - in: path
 *         name: cinemaId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của rạp chiếu phim
 *       - in: path
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Ngày muốn xem lịch (định dạng YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Danh sách suất chiếu theo ngày
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 *
 * /api/v1/show-times/movies/{movieId}/provinces:
 *   get:
 *     summary: Lấy danh sách tỉnh/thành phố có chiếu một phim cụ thể
 *     tags: [Showtimes]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của phim
 *     responses:
 *       200:
 *         description: Danh sách tỉnh/thành phố
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 *
 * /api/v1/show-times/movies/{movieId}/provinces/{province}/cinemas:
 *   get:
 *     summary: Lấy danh sách rạp chiếu một phim cụ thể trong tỉnh/thành phố
 *     tags: [Showtimes]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của phim
 *       - in: path
 *         name: province
 *         schema:
 *           type: string
 *         required: true
 *         description: Tên tỉnh/thành phố
 *     responses:
 *       200:
 *         description: Danh sách rạp chiếu
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 *
 * /api/v1/show-times/movies/{movieId}/cinemas/{cinemaId}/dates:
 *   get:
 *     summary: Lấy danh sách ngày chiếu phim tại một rạp cụ thể
 *     tags: [Showtimes]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của phim
 *       - in: path
 *         name: cinemaId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của rạp
 *     responses:
 *       200:
 *         description: Danh sách ngày chiếu
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 *
 * /api/v1/show-times/movies/{movieId}/cinemas/{cinemaId}/dates/{date}:
 *   get:
 *     summary: Lấy danh sách suất chiếu của một phim tại một rạp vào một ngày cụ thể
 *     tags: [Showtimes]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của phim
 *       - in: path
 *         name: cinemaId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của rạp
 *       - in: path
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Ngày chiếu (định dạng YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Danh sách suất chiếu
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/filter', showTimeController.getShowTimeFilter);

// ========== Flow 1: Cinema -> Dates -> Showtimes ==========
router.get('/cinemas/:cinemaId/dates', showTimeController.getAvailableDates);
router.get('/cinemas/:cinemaId/dates/:date', showTimeController.getShowtimesByDateAndCinema);

// ========== Flow 2: Movie -> Province -> Cinema -> Date -> Showtimes ==========
router.get('/movies/:movieId/provinces', showTimeController.getProvincesByMovie);
router.get('/movies/:movieId/provinces/:province/cinemas', showTimeController.getCinemasByMovieAndProvince);
router.get('/movies/:movieId/cinemas/:cinemaId/dates', showTimeController.getDatesByMovieAndCinema);
router.get('/movies/:movieId/cinemas/:cinemaId/dates/:date', showTimeController.getShowtimesByMovieCinemaAndDate);


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
 *         name: search[name]
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
 *         example: "60d21b4667d0d8992e610c85"
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
     .post(showTimeController.createShowTime);

 router.route('/:id')
     .get(showTimeController.getOneShowTimeById)
     .patch(showTimeController.updateShowTime)
     .delete(showTimeController.deleteShowTime);

 router.delete('/:id', showTimeController.deleteShowTime);
module.exports = router;