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

router.post("/query/momo", paymentController.queryMomoPayment);

router.post("/query/zalopay", paymentController.queryZaloPayPayment);


router.post("/callback/momo", paymentController.momoCallback);

/**
 * @swagger
 * /api/v1/payments/callback/vnpay:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Xử lý callback từ VNPAY sau khi thanh toán
 *     description: |
 *       Endpoint này được gọi từ FE sau khi VNPAY redirect người dùng về.
 *       Kiểm tra tính hợp lệ của giao dịch bằng chữ ký và cập nhật trạng thái đơn hàng.
 *     parameters:
 *       - in: query
 *         name: vnp_Amount
 *         schema:
 *           type: string
 *         required: true
 *         description: Số tiền giao dịch (đơn vị VND x 100, ví dụ 4900000 cho 49,000 VND)
 *       - in: query
 *         name: vnp_TxnRef
 *         schema:
 *           type: string
 *         required: true
 *         description: Mã đơn hàng
 *       - in: query
 *         name: vnp_ResponseCode
 *         schema:
 *           type: string
 *         required: true
 *         description: Mã phản hồi từ VNPAY (00 = thành công)
 *       - in: query
 *         name: vnp_SecureHash
 *         schema:
 *           type: string
 *         required: true
 *         description: Hash để xác thực giao dịch
 *       - in: query
 *         name: vnp_SecureHashType
 *         schema:
 *           type: string
 *         required: true
 *         description: Thuật toán hash (ví dụ SHA512)
 *     responses:
 *       200:
 *         description: Thanh toán thành công
 *       400:
 *         description: Thanh toán thất bại hoặc dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/callback/vnpay", paymentController.vnpayCallback);

router.post("/callback/zalopay", paymentController.zalopayCallback);


module.exports = router;
