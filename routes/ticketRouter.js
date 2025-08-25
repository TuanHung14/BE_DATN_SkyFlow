const express = require('express');
const ticketController = require('../controller/ticketController');
const auth = require('../middleware/authMiddleware');
const authorizer = require('../middleware/authorizeMiddleware');
const { Resource} = require("../model/permissionModel");
const { getRBACOnResorce } = require("../utils/helper");
const permissions = getRBACOnResorce(Resource.Ticket);

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

/**
 * @swagger
 * /api/v1/tickets/me:
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Lấy danh sách vé của người dùng
 *     operationId: getMyTickets
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang muốn lấy (bắt đầu từ 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng vé mỗi trang
 *     responses:
 *       200:
 *         description: Lấy danh sách vé thành công
 *       401:
 *         description: Chưa xác thực
 */
router.get('/me', ticketController.getMyTickets);

/**
 * @swagger
 * /api/v1/tickets/me/{id}:
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Lấy thông tin vé theo ID
 *     operationId: getTicketById
 *     security:
 *       - bearer: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của vé
 *         schema:
 *           type: string
 *           example: "68663039b703fa2c4d274937"
 *     responses:
 *       200:
 *         description: Lấy thông tin vé thành công
 *       401:
 *         description: Chưa xác thực
 *       404:
 *         description: Không tìm thấy vé
 */
router.get('/me/:id', ticketController.getTicketById);

/**
 * @swagger
 * /api/v1/tickets/admin:
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Lấy danh sách tất cả vé
 *     operationId: getAllTicketsAdmin
 *     security:
 *       - bearer: []
 *     responses:
 *       200:
 *         description: Lấy danh sách vé thành công
 *       401:
 *         description: Chưa xác thực
 */
router.get("/admin", ticketController.getAllTicketsAdminDashboard);

/**
 * @swagger
 * /api/v1/tickets/admin:
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Lấy danh sách tất cả vé
 *     operationId: getAllTicketsAdmin
 *     security:
 *       - bearer: []
 *     responses:
 *       200:
 *         description: Lấy danh sách vé thành công
 *       401:
 *         description: Chưa xác thực
 */
router.get("/admins", ticketController.getAllTicketsAdmin);

/**
 * @swagger
 * /api/v1/tickets/scan/{ticketCode}:
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Quét mã vé và lấy thông tin vé
 *     operationId: scanTicket
 *     security:
 *       - bearer: []
 *     parameters:
 *       - name: ticketCode
 *         in: path
 *         required: true
 *         description: Mã code của vé cần quét
 *         schema:
 *           type: string
 *           example: "ABC123XYZ"
 *     responses:
 *       200:
 *         description: Quét vé thành công, trả về thông tin vé
 *       401:
 *         description: Chưa xác thực
 *       404:
 *         description: Không tìm thấy vé với mã đã cung cấp
 */
router.get("/scan/:ticketCode", authorizer(permissions['read']), ticketController.scanTicket);

module.exports = router;