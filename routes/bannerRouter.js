const express = require("express");
const bannerController = require("../controller/bannerController");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Banners
 *   description: Quản lý thông tin banner
 */

/**
 * @swagger
 * /api/v1/banners:
 *   get:
 *     summary: Lấy tất cả banners
 *     tags: [Banners]
 *     responses:
 *       200:
 *         description: Danh sách banners
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   imageUrl:
 *                     type: string
 */
router.get("/", bannerController.getAllBanners);

/**
 * @swagger
 * /api/v1/banners/{id}:
 *   get:
 *     summary: Lấy 1 banner theo ID
 *     tags: [Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của banner
 *     responses:
 *       200:
 *         description: Thông tin banner
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *       404:
 *         description: Không tìm thấy banner
 */
router.get("/:id", bannerController.getBannerById);

/**
 * @swagger
 * /api/v1/banners:
 *   post:
 *     summary: Tạo banner mới
 *     tags: [Banners]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - imageUrl
 *             properties:
 *               title:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *             example:
 *               title: Banner khuyen mai he
 *               imageUrl: https://example.com/banner.jpg
 *     responses:
 *       201:
 *         description: Tạo banner thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post("/", bannerController.createBanner);

/**
 * @swagger
 * /api/v1/banners/{id}:
 *   patch:
 *     summary: Cập nhật banner theo ID
 *     tags: [Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của banner
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *             example:
 *               title: Banner da cap nhat
 *               imageUrl: https://example.com/banner-updated.jpg
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy banner
 */
router.patch("/:id", bannerController.updateBanner);

/**
 * @swagger
 * /api/v1/banners/{id}:
 *   delete:
 *     summary: Xóa banner theo ID
 *     tags: [Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của banner
 *     responses:
 *       204:
 *         description: Xóa thành công, không có nội dung trả về
 *       404:
 *         description: Không tìm thấy banner
 */
router.delete("/:id", bannerController.deleteBanner);

module.exports = router;
