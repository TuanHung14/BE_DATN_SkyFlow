const express = require("express");
const movieController = require("../controller/movieController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Movies
 *     description: Quản lý phim (người dùng và admin)
 */

/**
 * @swagger
 * /api/v1/movies/admin:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [Movies]
 *     summary: Lấy danh sách phim có lọc, sắp xếp, phân trang
 *     operationId: getAllMoviesAdmin
 *     parameters:
 *       - in: query
 *         name: search[name]
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên phim
 *       - in: query
 *         name: directorId
 *         schema:
 *           type: string
 *         description: Lọc theo đạo diễn
 *       - in: query
 *         name: castId
 *         schema:
 *           type: string
 *         description: Lọc theo diễn viên
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: "Sắp xếp kết quả (ví dụ: sort=name,-releaseDate)"
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: "Giới hạn trường được trả về (ví dụ: fields=name,slug)"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng phim mỗi trang
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Lọc theo thể loại
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NOW_SHOWING, COMING_SOON]
 *         description: Lọc theo trạng thái
 *     responses:
 *       200:
 *         description: Lấy danh sách phim thành công
 *       500:
 *         description: Lỗi máy chủ
 */

router.get("/admin", movieController.getAllMoviesAdmin);

/**
 * @swagger
 * /api/v1/movies/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Lấy chi tiết một phim
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của phim
 *     responses:
 *       200:
 *         description: Thông tin phim
 */
router.get("/:id", movieController.getMovie);

/**
 * @swagger
 * /api/v1/movies/:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Tạo một phim mới
 *     tags: [Movies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - nation
 *               - releaseDate
 *               - duration
 *               - description
 *               - age
 *               - posterUrl
 *               - trailerUrl
 *               - directorId
 *               - genresId
 *               - castId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Avengers: Endgame"
 *               nation:
 *                 type: string
 *                 example: "USA"
 *               releaseDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-06-01"
 *               duration:
 *                 type: number
 *                 example: 181
 *               description:
 *                 type: string
 *                 example: "Trận chiến cuối cùng giữa các Avengers và Thanos."
 *               age:
 *                 type: number
 *                 enum: [0, 13, 16, 18]
 *                 example: 13
 *               posterUrl:
 *                 type: string
 *                 example: "http://res.cloudinary.com/dxfcmhnao/image/upload/v1747728827/eupp3fgksa0cbdkm4t9c.jpg"
 *               trailerUrl:
 *                 type: string
 *                 example: "https://youtube.com/watch?v=TcMBFSGVi1c"
 *               directorId:
 *                 type: string
 *                 example: 682afc04b6acee1fab2f084f
 *               genresId:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: 682afc04b6acee1fab2f084f
 *               castId:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: 682afc04b6acee1fab2f084f
 *     responses:
 *       201:
 *         description: Phim đã được tạo thành công
 *       400:
 *         description: Dữ liệu gửi lên không hợp lệ
 */
router.post("/", movieController.createMovie);

/**
 * @swagger
 * /api/v1/movies/{id}:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Cập nhật thông tin phim
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của phim
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Avengers: Endgame"
 *               nation:
 *                 type: string
 *                 example: "USA"
 *               releaseDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-06-01"
 *               duration:
 *                 type: number
 *                 example: 181
 *               description:
 *                 type: string
 *                 example: "Trận chiến cuối cùng giữa các Avengers và Thanos."
 *               age:
 *                 type: number
 *                 enum: [0, 13, 16, 18]
 *                 example: 13
 *               posterUrl:
 *                 type: string
 *                 example: "http://res.cloudinary.com/dxfcmhnao/image/upload/v1747728827/eupp3fgksa0cbdkm4t9c.jpg"
 *               trailerUrl:
 *                 type: string
 *                 example: "https://youtube.com/watch?v=TcMBFSGVi1c"
 *               directorId:
 *                 type: string
 *                 example: "682afc04b6acee1fab2f084f"
 *               genresId:
 *                 type: string
 *                 example: "682afc04b6acee1fab2f084f"
 *               castId:
 *                 type: string
 *                 example: "682afc04b6acee1fab2f084f"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy phim
 */
router.patch("/:id", movieController.updateMovie);

/**
 * @swagger
 * /api/v1/movies/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Xoá mềm một phim
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của phim
 *     responses:
 *       204:
 *         description: Xoá thành công (không trả về nội dung)
 *       404:
 *         description: Không tìm thấy phim
 */
router.delete("/:id", movieController.softDeleteMovie);

/**
 * @swagger
 * /api/v1/movies:
 *   get:
 *     tags: [Movies]
 *     summary: Lấy danh sách phim có lọc, sắp xếp, phân trang
 *     operationId: getAllMoviesUser
 *     parameters:
 *       - in: query
 *         name: search[name]
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên phim
 *       - in: query
 *         name: directorId
 *         schema:
 *           type: string
 *         description: Lọc theo đạo diễn
 *       - in: query
 *         name: castId
 *         schema:
 *           type: string
 *         description: Lọc theo diễn viên
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: "Sắp xếp kết quả (ví dụ: sort=name,-releaseDate)"
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: "Giới hạn trường được trả về (ví dụ: fields=name,slug)"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng phim mỗi trang
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Lọc theo thể loại
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NOW_SHOWING, COMING_SOON]
 *         description: Lọc theo trạng thái
 *     responses:
 *       200:
 *         description: Lấy danh sách phim thành công
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/", movieController.getAllMovies);

/**
 * @swagger
 * /api/v1/movies/slug/{slug}:
 *   get:
 *     summary: Lấy phim theo slug
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: "Slug của phim (ví dụ: avengers-endgame)"
 *     responses:
 *       200:
 *         description: Thông tin phim theo slug
 *       404:
 *         description: Không tìm thấy phim
 */
router.get("/slug/:slug", movieController.getMovieBySlug);
module.exports = router;
