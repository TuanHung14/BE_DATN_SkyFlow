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
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của phim cần đánh giá
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ticketId
 *               - rating
 *             properties:
 *               ticketId:
 *                 type: string
 *                 example: "68314e4833e810b1c25e55da"
 *               rating:
 *                 type: integer
 *                 example: 5
 *               review:
 *                 type: string
 *                 example: "Phim rất hay, diễn xuất tuyệt vời!"
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

/**
 * @swagger
 * /api/v1/movies/{movieId}/movie-ratings:
 *   get:
 *     summary: Lấy tất cả đánh giá của một bộ phim
 *     description: Trả về danh sách các đánh giá (rating & review) cho bộ phim theo movieId
 *     tags: [Movie Ratings]
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bộ phim
 *     responses:
 *       200:
 *         description: Danh sách các đánh giá của phim
 *       400:
 *         description: movieId không hợp lệ
 *       404:
 *         description: Không tìm thấy đánh giá cho bộ phim này
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/", movieRatingController.getAllMovieRatings);

module.exports = router;