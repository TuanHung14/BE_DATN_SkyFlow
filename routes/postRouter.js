const express = require("express");
const postController = require("../controller/postController");
const auth  = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID bài viết
 *         title:
 *           type: string
 *           description: Tiêu đề bài viết
 *         description:
 *           type: string
 *           description: Mô tả ngắn bài viết
 *         content:
 *           type: string
 *           description: Nội dung chi tiết bài viết
 *         imgUrl:
 *           type: string
 *           description: URL ảnh đại diện
 *         slug:
 *           type: string
 *           description: Slug tự động tạo từ title
 *         views:
 *           type: number
 *           description: Lượt xem bài viết
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Quản lý bài viết
 */

/**
 * @swagger
 * /api/v1/posts:
 *   get:
 *     summary: Lấy tất cả bài viết
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Danh sách bài viết
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 */
router.get("/", postController.getAllPosts);

/**
 * @swagger
 * /api/v1/posts:
 *   post:
 *     summary: Tạo bài viết mới
 *     tags: [Posts]
 *     security:
 *       - bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - content
 *               - imgUrl
 *             properties:
 *               title:
 *                 type: string
 *                 description: Tiêu đề bài viết
 *                 example: "Học Node.js cơ bản"
 *               description:
 *                 type: string
 *                 description: Mô tả ngắn bài viết
 *                 example: "Hướng dẫn chi tiết về Node.js từ cơ bản đến nâng cao"
 *               content:
 *                 type: string
 *                 description: Nội dung chi tiết bài viết
 *                 example: "Node.js là một runtime environment..."
 *               imgUrl:
 *                 type: string
 *                 description: URL ảnh đại diện
 *                 example: "https://example.com/nodejs-cover.jpg"
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post("/", auth, postController.createPost);

/**
 * @swagger
 * /api/v1/posts/favorites:
 *   get:
 *     summary: Lấy danh sách bài viết đã like
 *     tags: [Posts]
 *     security:
 *       - bearer: []
 *     responses:
 *       200:
 *         description: Danh sách yêu thích
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 */
router.get("/favorites", auth, postController.getFavoritePosts);

/**
 * @swagger
 * /api/v1/posts/{id}/like:
 *   post:
 *     summary: Like hoặc Unlike bài viết
 *     tags: [Posts]
 *     security:
 *       - bearer: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID bài viết
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đã unlike bài viết
 *       201:
 *         description: Đã like bài viết
 *       404:
 *         description: Không tìm thấy bài viết
 */
router.post("/:id/like", auth, postController.likePost);

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   get:
 *     summary: Lấy bài viết theo ID
 *     tags: [Posts]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID bài viết
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trả về bài viết
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       404:
 *         description: Không tìm thấy bài viết
 */
router.get("/:id", postController.getPostById);

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   patch:
 *     summary: Cập nhật bài viết
 *     tags: [Posts]
 *     security:
 *       - bearer: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID bài viết
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Tiêu đề mới
 *                 example: "Học Node.js nâng cao"
 *               description:
 *                 type: string
 *                 description: Mô tả mới
 *                 example: "Hướng dẫn Node.js cho người có kinh nghiệm"
 *               content:
 *                 type: string
 *                 description: Nội dung mới
 *                 example: "Trong phần này chúng ta sẽ học..."
 *               imgUrl:
 *                 type: string
 *                 description: URL ảnh đại diện mới
 *                 example: "https://example.com/new-cover.jpg"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       404:
 *         description: Không tìm thấy bài viết
 */
router.patch("/:id", auth, postController.updatePost);

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   delete:
 *     summary: Xóa bài viết (mềm)
 *     tags: [Posts]
 *     security:
 *       - bearer: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID bài viết
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy bài viết
 */
router.delete("/:id", auth, postController.deletePost);

/**
 * @swagger
 * /api/v1/posts/slug/{slug}:
 *   get:
 *     summary: Lấy bài viết theo slug (tăng lượt xem)
 *     tags: [Posts]
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         description: Slug bài viết
 *         schema:
 *           type: string
 *           example: "hoc-nodejs-co-ban"
 *     responses:
 *       200:
 *         description: Trả về bài viết theo slug
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
 *                   properties:
 *                     post:
 *                       $ref: '#/components/schemas/Post'
 *       404:
 *         description: Không tìm thấy bài viết
 */
router.get("/slug/:slug", postController.getPostBySlug);

/**
 * @swagger
 * /api/v1/posts/{id}/liked:
 *   get:
 *     summary: Kiểm tra người dùng đã like bài viết hay chưa
 *     tags: [Posts]
 *     security:
 *       - bearer: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID bài viết
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trạng thái like
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 liked:
 *                   type: boolean
 *                   example: true
 */
router.get("/:id/liked", auth, postController.checkLikedPost);

module.exports = router;
