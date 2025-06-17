const express = require("express");
const settingController = require("../controller/settingController");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Quản lý thông tin cấu hình hệ thống
 */

/**
 * @swagger
 * /api/v1/settings:
 *   get:
 *     summary: Lấy tất cả settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Danh sách settings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   companyName:
 *                     type: string
 *                   address:
 *                     type: string
 *                   contactEmail:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *                   logoUrl:
 *                     type: string
 */
router.get("/", settingController.getAllSettings);

/**
 * @swagger
 * /api/v1/settings/{id}:
 *   get:
 *     summary: Lấy 1 setting theo ID
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của setting
 *     responses:
 *       200:
 *         description: Thông tin setting
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 companyName:
 *                   type: string
 *                 address:
 *                   type: string
 *                 contactEmail:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *                 logoUrl:
 *                   type: string
 *       404:
 *         description: Không tìm thấy setting
 */
router.get("/:id", settingController.getSettingById);

/**
 * @swagger
 * /api/v1/settings:
 *   post:
 *     summary: Tạo setting mới
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - address
 *               - contactEmail
 *               - phoneNumber
 *             properties:
 *               companyName:
 *                 type: string
 *                 default: "Công ty SkyFlow"
 *               address:
 *                 type: string
 *                 default: "123 Đường ABC, Quận 1, TP.HCM"
 *               contactEmail:
 *                 type: string
 *                 default: "contact@abc.com"
 *               phoneNumber:
 *                 type: string
 *                 default: "0123456789"
 *               logoUrl:
 *                 type: string
 *                 default: "https://example.com/logo.png"
 *     responses:
 *       201:
 *         description: Setting đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 companyName:
 *                   type: string
 *                 address:
 *                   type: string
 *                 contactEmail:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *                 logoUrl:
 *                   type: string
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post("/", settingController.createSetting);

/**
 * @swagger
 * /api/v1/settings/{id}:
 *   patch:
 *     summary: Cập nhật setting
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của setting
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *               address:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *             example:
 *               companyName: Công ty TNHH XYZ
 *               address: 456 Đường XYZ, Quận 3, TP.HCM
 *               contactEmail: support@xyz.com
 *               phoneNumber: "0987654321"
 *               logoUrl: https://example.com/new-logo.png
 *     responses:
 *       200:
 *         description: Đã cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 companyName:
 *                   type: string
 *                 address:
 *                   type: string
 *                 contactEmail:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *                 logoUrl:
 *                   type: string
 *       404:
 *         description: Không tìm thấy setting
 */
router.patch("/:id", settingController.updateSetting);

/**
 * @swagger
 * /api/v1/settings/{id}:
 *   delete:
 *     summary: Xoá setting
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của setting
 *     responses:
 *       204:
 *         description: Xoá thành công, không có nội dung trả về
 *       404:
 *         description: Không tìm thấy setting
 */
router.delete("/:id", settingController.deleteSetting);
/**
 * @swagger
 * /api/v1/settings/{id}/set-default:
 *   patch:
 *     summary: Đặt setting làm mặc định
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của setting cần đặt làm mặc định
 *     responses:
 *       200:
 *         description: Đã đặt setting làm mặc định thành công
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
 *                   example: Đã đặt setting mặc định
 *                 data:
 *                   type: object
 *                   properties:
 *                     setting:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         companyName:
 *                           type: string
 *                         address:
 *                           type: string
 *                         contactEmail:
 *                           type: string
 *                         phoneNumber:
 *                           type: string
 *                         logoUrl:
 *                           type: string
 *                         isDefault:
 *                           type: boolean
 *       404:
 *         description: Không tìm thấy setting với ID đã cho
 */
router.patch("/:id/set-default", settingController.setDefault);

module.exports = router;
