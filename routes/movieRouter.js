const express = require("express");
const movieController = require("../controller/movieController");
const { auth, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Movies
 *     description: Quản lý phim (người dùng)
 */

/**
 * @swagger
 * /api/v1/movies:
 *   get:
 *     tags: [Movies]
 *     summary: Lấy danh sách phim có lọc, sắp xếp, phân trang
 *     operationId: getAllMovies
 *     parameters:
 *       - in: query
 *         name: search[name]
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên phim
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
 *           enum: [horror, action, comedy, drama]
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
 * /api/v1/movies/{id}:
 *   get:
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
 * tags:
 *   - name: AdminMovies
 *     description: Quản lý phim (Admin)
 */

/**
 * @swagger
 * /api/v1/admin/movies:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags: [AdminMovies]
 *     summary: Lấy danh sách phim có lọc, sắp xếp, phân trang
 *     operationId: getAllMovies
 *     parameters:
 *       - in: query
 *         name: search[name]
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên phim
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
 *           enum: [horror, action, comedy, drama]
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

router.get("/", auth, restrictTo("admin"), movieController.getAllMovies);

/**
 * @swagger
 * /api/v1/admin/movies/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Lấy chi tiết một phim
 *     tags: [AdminMovies]
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

router.get("/:id", auth, restrictTo("admin"), movieController.getMovie);
/**
 * @swagger
 * /api/v1/admin/movies:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Tạo một phim mới
 *     tags: [AdminMovies]
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
 *                 example: "664b88ecf75b1e92a7f2e321"
 *               genresId:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["664b8912f75b1e92a7f2e323", "664b891cf75b1e92a7f2e324"]
 *               castId:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["664b892df75b1e92a7f2e325", "664b8938f75b1e92a7f2e326"]
 *     responses:
 *       201:
 *         description: Phim đã được tạo thành công
 *       400:
 *         description: Dữ liệu gửi lên không hợp lệ
 */

router.post("/", auth, restrictTo("admin"), movieController.createMovie);
/**
 * @swagger
 * /api/v1/admin/movies/{id}:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Cập nhật thông tin phim
 *     tags: [AdminMovies]
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
 *                 example: "664b88ecf75b1e92a7f2e321"
 *               genresId:
 *                 type: string
 *                 example: "664b88ecf75b1e92a7f2e321"
 *               castId:
 *                 type: string
 *                 example: "664b88ecf75b1e92a7f2e321"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy phim
 */
router.patch("/:id", auth, restrictTo("admin"), movieController.updateMovie);

/**
 * @swagger
 * /api/v1/admin/movies/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Xoá mềm một phim
 *     tags: [AdminMovies]
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
router.delete(
  "/:id",
  auth,
  restrictTo("admin"),
  movieController.softDeleteMovie
);
module.exports = router;
