const express = require("express");
const paymentController = require("../controller/paymentController");

const router = express.Router();

/**
 * @swagger
 * /api/v1/payments:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Tạo thanh toán mới
 *     security:
 *       - bearer: []
 *     operationId: createPayment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - orderId
 *               - paymentMethod
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 100000
 *               orderId:
 *                 type: string
 *                 example: "ORDER123456"
 *               gateway:
 *                 type: string
 *                 example: "Momo | VnPay | Zalopay"
 *     responses:
 *       200:
 *         description: Thanh toán được tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post("/", paymentController.createPayment);

/**
 * @swagger
 * /api/v1/payments:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Lấy danh sách phương thức
 *     operationId: getPaymentGateways
 *     security:
 *       - bearer: []
 *     responses:
 *       200:
 *         description: Lấy danh sách phương thức thành công
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/", paymentController.getPaymentGateways);

router.post("/callback/momo", paymentController.momoCallback);

router.get("/callback/vnpay", paymentController.vnpayCallback);

router.post("/callback/zalopay", paymentController.zalopayCallback);

module.exports = router;
