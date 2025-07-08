const express = require('express');
const movieRatingController = require('../controller/movieRatingController');

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /api/v1/movies/{id}/movie-ratings:
 *   post:
 *     summary: Tạo đánh giá phim mới
 *     description: Tạo đánh giá mới cho một bộ phim
 *     tags: [Movie Ratings]
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
 *                 type: string
 *                 example: "68314e4833e810b1c25e55da"
 *               movieId:
 *                 type: string
 *                 example: "682f5b7ab23c54d8e5f1627e"
 *               rating:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Đánh giá được tạo thành công
 *       400:
 *         description: Dữ liệu yêu cầu không hợp lệ
 *       401:
 *         description: Không được ủy quyền
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/", movieRatingController.createMovieRating);

module.exports = router;