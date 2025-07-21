const express = require('express');
const bookingController = require('../controller/bookingController');
const router = express.Router();


/**
 * @swagger
 * /api/v1/bookings:
 *   get:
 *     tags:
 *       - Booking
 *     summary: API luồng chọn vé xem phim
 *     operationId: getTicketBooking
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: query
 *         name: movieId
 *         schema:
 *           type: string
 *         description: ID phim cần lấy thông tin
 *       - in: query
 *         name: showDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày chiếu cần xem (yyyy-mm-dd)
 *       - in: query
 *         name: cinemaId
 *         schema:
 *           type: string
 *         description: ID rạp để lấy danh sách suất chiếu
 *       - in: query
 *         name: showtimeId
 *         schema:
 *           type: string
 *         description: ID suất chiếu để lấy thông tin chọn ghế
 *       - in: query
 *         name: province
 *         schema:
 *          type: string
 *         description: Tỉnh/thành phố để lọc danh sách rạp chiếu và suất chiếu
 *     responses:
 *       200:
 *         description: Trả về dữ liệu theo bước đang chọn
 *         content:
 *           application/json:
 *             examples:
 *               Step1:
 *                 summary: Danh sách phim đang chiếu
 *                 value:
 *                   status: success
 *                   step: movies
 *                   data: [...]
 *               Step2:
 *                 summary: Danh sách ngày chiếu của phim
 *                 value:
 *                   status: success
 *                   step: show-dates
 *                   data: [...]
 *               Step3:
 *                 summary: Danh sách rạp chiếu trong ngày
 *                 value:
 *                   status: success
 *                   step: cinemas
 *                   data: [...]
 *               Step4:
 *                 summary: Danh sách suất chiếu tại rạp
 *                 value:
 *                   status: success
 *                   step: showtimes
 *                   data: [...]
 *               Step5:
 *                 summary: Chi tiết suất chiếu để chọn ghế
 *                 value:
 *                   status: success
 *                   step: seat-selection
 *                   data: {...}
 *       400:
 *         description: Tham số không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/", bookingController.getTicketBooking);

module.exports = router;