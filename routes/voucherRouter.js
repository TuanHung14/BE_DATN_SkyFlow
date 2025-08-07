const voucherController = require("../controller/voucherController");
const voucherUseController = require("../controller/voucherUseController");
const express = require("express");
const auth = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorizeMiddleware");
const { Resource} = require("../model/permissionModel");
const { getRBACOnResorce } = require("../utils/helper");
const permissions = getRBACOnResorce(Resource.Voucher);

const router = express.Router();

/**
 * @swagger
 * /api/v1/vouchers:
 *   get:
 *     tags:
 *       - Voucher
 *     summary: Lấy danh sách tất cả voucher
 *     operationId: getAllVouchers
 *     responses:
 *       200:
 *         description: Danh sách voucher
 *   post:
 *     tags:
 *       - Voucher
 *     summary: Tạo voucher mới
 *     operationId: createVoucher
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - discount
 *               - expiryDate
 *             properties:
 *               voucherCode:
 *                 type: string
 *                 example: "DISCOUNT2025"
 *               voucherName:
 *                 type: string
 *                 example: "Giảm giá 20%"
 *               discountValue:
 *                 type: number
 *                 example: 200000
 *               minimumOrderAmount:
 *                 type: number
 *                 example: 300000
 *               points:
 *                 type: number
 *                 example: 1000
 *               description:
 *                 type: string
 *                 example: "Voucher giảm giá 20% cho tất cả các vé"
 *               imageUrl:
 *                 type: string
 *                 example: "https://example.com/voucher-image.jpg"
 *     responses:
 *       201:
 *         description: Voucher được tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.route("/")
    .get(voucherController.getAllVouchers)
    .post(auth, authorize(permissions['create']),voucherController.createVoucher);
router.use(auth);
/**
 * @swagger
 * /api/v1/vouchers/owned:
 *   get:
 *     tags:
 *       - Voucher
 *     summary: Lấy danh sách voucher đã mua của người dùng
 *     description: Chỉ trả về các voucher người dùng đã mua và còn trong giới hạn sử dụng.
 *     security:
 *       - bearer: []
 *     operationId: getOwnedVouchers
 *     parameters:
 *       - in: query
 *         name: price
 *         schema:
 *           type: number
 *           example: 150000
 *         required: true
 *         description: Giá trị đơn hàng hiện tại để lọc các voucher đủ điều kiện sử dụng (dựa trên minimumOrderAmount).
 *     responses:
 *       200:
 *         description: Danh sách voucher đã mua
 */
router.get("/owned", voucherUseController.getVoucherUsage);

/**
 * @swagger
 * /api/v1/vouchers/buy:
 *   post:
 *     tags:
 *       - Voucher
 *     summary: Người dùng mua voucher bằng điểm
 *     description: API cho phép người dùng đổi điểm tích lũy để mua voucher.
 *     security:
 *       - bearer: []
 *     operationId: buyVoucher
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - voucherId
 *             properties:
 *               voucherId:
 *                 type: string
 *                 description: ID của voucher muốn mua
 *                 example: "60d21b4667d0d8992e610c85"
 *               quantity:
 *                 type: number
 *                 description: Số lần có thể sử dụng (nếu cho phép chọn)
 *                 example: 3
 *     responses:
 *       201:
 *         description: Mua voucher thành công
 *       400:
 *         description: Lỗi khi mua voucher (hết điểm hoặc đã mua)
 *       401:
 *         description: Chưa đăng nhập
 */
router.post("/buy", voucherUseController.buyVoucher);

/**
 * @swagger
 * /api/v1/vouchers/{id}:
 *   get:
 *     tags:
 *       - Voucher
 *     summary: Lấy thông tin chi tiết một voucher
 *     operationId: getVoucher
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của voucher
 *         schema:
 *           type: string
 *           example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       200:
 *         description: Chi tiết voucher
 *       404:
 *         description: Không tìm thấy voucher
 *   patch:
 *     tags:
 *       - Voucher
 *     summary: Cập nhật thông tin voucher
 *     operationId: updateVoucher
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của voucher
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               voucherCode:
 *                 type: string
 *                 example: "DISCOUNT2025"
 *               voucherName:
 *                 type: string
 *                 example: "Giảm giá 20%"
 *               discountValue:
 *                 type: number
 *                 example: 200000
 *               minimumOrderAmount:
 *                 type: number
 *                 example: 300000
 *               points:
 *                 type: number
 *                 example: 1000
 *               description:
 *                 type: string
 *                 example: "Voucher giảm giá 20% cho tất cả các vé"
 *               imageUrl:
 *                 type: string
 *                 example: "https://example.com/voucher-image.jpg"
 *     responses:
 *       200:
 *         description: Voucher được cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy voucher
 *   delete:
 *     tags:
 *       - Voucher
 *     summary: Xóa voucher theo ID
 *     operationId: deleteVoucher
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của voucher
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Xóa thành công (không có nội dung)
 *       404:
 *         description: Không tìm thấy voucher
 */
router.route("/:id")
    .get(voucherController.getVoucher)
    .patch(authorize(permissions['update']), voucherController.updateVoucher)
    .delete(authorize(permissions['delete']), voucherController.deleteVoucher);


module.exports = router;