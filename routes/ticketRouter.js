const express = require('express');
const ticketController = require('../controller/ticketController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.use(auth);

/**
 * @swagger
 * /api/v1/tickets:
 *   post:
 *     tags:
 *       - Tickets
 *     summary: Tạo vé xem phim mới
 *     operationId: createTicket
 *     security:
 *       - bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - showtimeId
 *               - seatsId
 *               - paymentMethodId
 *             properties:
 *               showtimeId:
 *                 type: string
 *                 description: ID suất chiếu
 *                 example: "685c157a87523ac7c0abedb6"
 *               seatsId:
 *                 type: array
 *                 description: Danh sách ghế đã chọn
 *                 items:
 *                   type: string
 *                 example: ["685c24040d64c0a7c1b2d7c4"]
 *               foodsId:
 *                 type: array
 *                 description: Danh sách món ăn (không bắt buộc)
 *                 items:
 *                   type: object
 *                   properties:
 *                     foodId:
 *                       type: string
 *                       example: "667ae0462e0c7d35ec4480f0"
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *               paymentMethodId:
 *                 type: string
 *                 description: ID phương thức thanh toán
 *                 example: "6864eb38b2de948dddb436f0"
 *               voucherUseId:
 *                 type: string
 *                 description: ID mã giảm giá (không bắt buộc)
 *                 example: "6864eb38b2de948dddb436f0"
 *     responses:
 *       201:
 *         description: Tạo vé thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa xác thực
 */
router.post('/', ticketController.createTicket);

module.exports = router;