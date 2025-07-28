const express = require("express");
const wishlistMovieController = require("../controller/wishlistMovieController");
const router = express.Router({ mergeParams: true });


/**
 * @swagger
 * /api/v1/movies/{movieId}/wish-list:
 *   post:
 *     tags:
 *       - Wishlist
 *     summary: Thêm hoặc xóa phim khỏi danh sách yêu thích
 *     operationId: toggleWishlistMovie
 *     parameters:
 *       - in: path
 *         name: movieId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của phim cần thêm hoặc xóa khỏi danh sách yêu thích
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Phim đã được thêm vào danh sách yêu thích
 *
 *       200:
 *         description: Phim đã được xóa khỏi danh sách yêu thích
 *
 *       404:
 *         description: Phim không tìm thấy hoặc không có sẵn
 *
 *   get:
 *     tags:
 *       - Wishlist
 *     summary: Lấy danh sách phim trong danh sách yêu thích
 *     operationId: getWishlistMovies
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách phim trong danh sách yêu thích
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
 *                     movies:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: ID của mục trong danh sách yêu thích
 *                           movieId:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 description: ID của phim
 *                               name:
 *                                 type: string
 *                                 description: Tên phim
 *                                 example: "Tên phim ví dụ"
 *                               ratingsAverage:
 *                                 type: number
 *                                 description: Điểm đánh giá trung bình
 *                                 example: 8.5
 *                               status:
 *                                 type: string
 *                                 description: Trạng thái phim
 *                                 example: PUBLISHED
 *                               posterUrl:
 *                                 type: string
 *                                 description: URL ảnh poster
 *                                 example: "https://example.com/poster.jpg"
 *                               trailerUrl:
 *                                 type: string
 *                                 description: URL trailer phim
 *                                 example: "https://example.com/trailer.mp4"
 *                               slug:
 *                                 type: string
 *                                 description: Slug của phim
 *                                 example: "ten-phim-vi-du"
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.post("/", wishlistMovieController.toggeleWishlistMovie);

/**
 * @swagger
 * /api/v1/movies/wish-list:
 *   get:
 *     tags:
 *       - Wishlist
 *     summary: Lấy danh sách phim trong danh sách yêu thích
 *     operationId: getWishlistMovies
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách phim trong danh sách yêu thích
 */
router.get("/", wishlistMovieController.getWishlistMovies);

module.exports = router;