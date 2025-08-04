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
 *       - bearer: []
 *     responses:
 *       201:
 *         description: Phim đã được thêm vào danh sách yêu thích
 *
 *       200:
 *         description: Phim đã được xóa khỏi danh sách yêu thích
 *
 *       404:
 *         description: Phim không tìm thấy hoặc không có sẵn
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
 *       - bearer: []
 *     responses:
 *       200:
 *         description: Danh sách phim trong danh sách yêu thích
 */
router.get("/", wishlistMovieController.getWishlistMovies);

module.exports = router;