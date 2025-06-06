const voucherController = require("../controller/voucherController");
const express = require("express");

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
    .post(voucherController.createVoucher);

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
    .patch(voucherController.updateVoucher)
    .delete(voucherController.deleteVoucher);

module.exports = router;