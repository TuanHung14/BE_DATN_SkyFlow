const express = require('express');
const movieRatingController = require('../controller/movieRatingController');
const { auth, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/v1/movie-rating/{id}:
 *   get:
 *     summary: Lấy thông tin đánh giá theo ID
 *     tags: [Movie Rating]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của đánh giá
 *     responses:
 *       200:
 *         description: Thông tin chi tiết đánh giá
 *       404:
 *         description: Không tìm thấy đánh giá
 */
router
  .route('/:id')
  .get(movieRatingController.getMovieRatingById);

/**
 * @swagger
 * /api/v1/movie-rating/user/{userId}:
 *   get:
 *     summary: Lấy tất cả đánh giá của một người dùng
 *     tags: [Movie Rating]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Danh sách đánh giá của người dùng
 */
router
  .route('/user/:userId')
  .get(movieRatingController.getAllRatingByUserId);

// router.use(auth);

/**
 * @swagger
 * /api/v1/movie-rating:
 *   get:
 *     summary: Lấy tất cả đánh giá phim
 *     tags: [Movie Rating]
 *     responses:
 *       200:
 *         description: Danh sách tất cả đánh giá phim
 *   post:
 *     summary: Tạo đánh giá phim mới
 *     tags: [Movie Rating]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - movieId
 *               - rating
 *             properties:
 *               userId:
 *                  type: string
 *                  example: 68314e9f33e810b1c25e55df
 *               movieId:
 *                 type: string
 *                 example: 60d21b4667d0d8992e610c85
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: Phim rất hay và ý nghĩa
 *     responses:
 *       201:
 *         description: Đánh giá đã được tạo
 */
router
    .route('/')
    .get(movieRatingController.getAllRatings)
    .post(movieRatingController.createMovieRating);

module.exports = router;