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
 *             properties:
 *               title:
 *                 type: string
 *               image_url:
 *                 type: string
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
 *         description: Xóa thành công
 */
router.delete("/:id", bannerController.deleteBanner);
module.exports = router;
