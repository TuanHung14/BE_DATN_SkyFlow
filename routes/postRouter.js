const express = require("express");
const postController = require("../controller/postController");
const authController = require("../controller/authController");

const router = express.Router();

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
 */
router.get("/", postController.getAllPosts);

/**
 * @swagger
 * /api/v1/posts:
 *   post:
 *     summary: Tạo bài viết mới
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post("/", postController.createPost);

/**
 * @swagger
 * /api/v1/posts/favorites:
 *   get:
 *     summary: Lấy danh sách bài viết đã like
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách yêu thích
 */
router.get("/favorites", postController.getFavoritePosts);

/**
 * @swagger
 * /api/v1/posts/{id}/like:
 *   post:
 *     summary: Toggle like/unlike bài viết
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID bài viết
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đã unlike
 *       201:
 *         description: Đã like
 *       404:
 *         description: Không tìm thấy bài viết
 */
router.post("/:id/like", postController.likePost);

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
 *         description: Thành công
 */
router.get("/:id", postController.getPostById);

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   patch:
 *     summary: Cập nhật bài viết
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
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
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch("/:id", postController.updatePost);

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   delete:
 *     summary: Xóa mềm bài viết
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
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
 */
router.delete("/:id", postController.deletePost);

module.exports = router;
