const epress = require('express');
const paymentController = require('../controller/paymentController');

const router = epress.Router();
/**
 * @swagger
 * /api/v1/payment:
 *   post:
 *     tags:
 *       - Payment
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
 *                 example: "momo"
 *     responses:
 *       200:
 *         description: Thanh toán được tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/', paymentController.createPayment);

/**
 * @swagger
 * /api/v1/payment/query/momo:
 *   post:
 *     tags:
 *       - Payment
 *     summary: Truy vấn trạng thái thanh toán Momo
 *     security:
 *       - bearer: []
 *     operationId: queryMomoPayment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: "ORDER123456"
 *     responses:
 *       200:
 *         description: Trả về thông tin thanh toán
 *       404:
 *         description: Không tìm thấy giao dịch
 */
router.post('/query/momo', paymentController.queryMomoPayment);

router.post('/callback/momo', paymentController.momoCallback);


module.exports = router;