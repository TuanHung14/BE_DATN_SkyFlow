const express = require("express");
const postController = require("../controller/postController");
const auth = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuthMiddleware");

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
 *               description:
 *                 type: string
 *               content:
 *                 type: string
 *               imgUrl:
 *                 type: string
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
 */
router.get("/favorites", auth, postController.getFavoritePosts);
/**
 * @swagger
 * /api/v1/posts/admin:
 *   get:
 *     summary: Lấy danh sách tất cả bài viết (bao gồm cả chưa publish)
 *     tags: [Posts]
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: "Sắp xếp theo trường, ví dụ: views, -createdAt"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số bài viết mỗi trang (mặc định 10)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Trang hiện tại (mặc định 1)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [preview, review]
 *         description: Lọc theo loại bài viết
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tiêu đề
 *     responses:
 *       200:
 *         description: Danh sách bài viết (admin) được lấy thành công
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
 */
router.get("/admin", auth, postController.getAllPostsAdmin);
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
 *               description:
 *                 type: string
 *               content:
 *                 type: string
 *               imgUrl:
 *                 type: string
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

router.use(optionalAuth);
/**
 * @swagger
 * /api/v1/posts/slug/{slug}:
 *   get:
 *     summary: Lấy bài viết theo slug (tăng lượt xem)
 *     tags: [Posts]
 *     security:
 *       - bearer: []
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema:
 *           type: string
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
 *       404:
 *         description: Không tìm thấy bài viết
 */
router.get("/slug/:slug", postController.getPostBySlug);

/**
 * @swagger
 * /api/v1/posts:
 *   get:
 *     summary: Lấy danh sách bài viết
 *     tags: [Posts]
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: "Sắp xếp theo trường, ví dụ: views, -createdAt"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số bài viết mỗi trang (mặc định 10)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Trang hiện tại (mặc định 1)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [preview, review]
 *         description: Lọc theo loại bài viết
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tiêu đề
 *     responses:
 *       200:
 *         description: Danh sách bài viết được lấy thành công
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
 *                   example: 100
 *                 totalPages:
 *                   type: integer
 *                   example: 10
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 */

router.get("/", postController.getAllPosts);

module.exports = router;
