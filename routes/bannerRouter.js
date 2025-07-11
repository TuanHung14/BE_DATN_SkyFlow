const express = require("express");
const bannerController = require("../controller/bannerController");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Banners
 *   description: Quản lý thông tin banner
 */

/**
 * @swagger
 * /api/v1/banners/admin:
 *   get:
 *     summary: Lấy tất cả banners cho quản trị viên
 *     tags: [Banners]
 *     parameters:
 *       - in: query
 *         name: search[title]
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tiêu đề banner
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng bản ghi mỗi trang
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: "Sắp xếp theo trường, ví dụ: -createdAt"
 *     responses:
 *       200:
 *         description: Danh sách banners cho quản trị viên
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 totalDocs:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           imageUrl:
 *                             type: string
 */
router.get("/admin", bannerController.getAllBannersAdmin);

/**
 * @swagger
 * /api/v1/banners:
 *   get:
 *     summary: Lấy tất cả banners
 *     tags: [Banners]
 *     parameters:
 *       - in: query
 *         name: search[title]
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tiêu đề banner
 *     responses:
 *       200:
 *         description: Danh sách banners
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           imageUrl:
 *                             type: string
 */
router.get("/", bannerController.getAllBannersClient);

router.use(auth);

router.use(auth);

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
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     imageUrl:
 *                       type: string
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
/**
 * @swagger
 * /api/v1/banners/{id}/change-status:
 *   patch:
 *     summary: Chuyển đổi trạng thái banner (active/inActive)
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
 *         description: Trạng thái đã được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *
 *       404:
 *         description: Không tìm thấy banner
 *       500:
 *         description: Lỗi server
 */
router.patch("/:id/change-status", bannerController.changeBannerStatus);
module.exports = router;
