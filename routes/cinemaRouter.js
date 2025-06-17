const express = require("express");
const cinemaController = require("../controller/cinemaController");
const  auth  = require("../middleware/authMiddleware");
const router = express.Router();

// router.use(auth);

/**
 * @swagger
 * /api/v1/cinemas:
 *   get:
 *     tags:
 *       - Cinemas
 *     summary: Hiển thị suất chiếu trong phần chi tiết
 *     operationId: getFilteredCinemas
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Lấy danh sách rạp chiếu phim thành công
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/', cinemaController.getFilteredCinemas);

/**
 * @swagger
 * /api/v1/cinemas/admin:
 *   get:
 *     tags:
 *       - Cinemas
 *     summary: Lấy danh sách rạp chiếu phim
 *     operationId: getAllCinemas
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *       - in: query
 *         name: search[name]
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên rạp
 *     responses:
 *       200:
 *         description: Lấy danh sách rạp chiếu phim thành công
 *       500:
 *         description: Lỗi máy chủ
 */
router.get("/admin", cinemaController.getAllCinemas);

/**
 * @swagger
 * /api/v1/cinemas:
 *   post:
 *     tags:
 *       - Cinemas
 *     summary: Tạo rạp chiếu phim mới
 *     operationId: createCinema
 *     security:
 *       - bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - province
 *               - district
 *               - ward
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên rạp chiếu phim
 *               province:
 *                 type: string
 *                 description: Thành phố hoặc tỉnh của rạp
 *               district:
 *                 type: string
 *                 description: Quận huyện của rạp
 *               ward:
 *                 type: string
 *                 description: Phường xã của rạp
 *               address:
 *                 type: string
 *                 description: Địa chỉ chi tiết của rạp
 *               description:
 *                 type: string
 *                 description: Mô tả về rạp
 *     responses:
 *       201:
 *         description: Tạo rạp chiếu phim thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.post("/", cinemaController.createCinema);

/**
 * @swagger
 * /api/v1/cinemas/{id}:
 *   get:
 *     tags:
 *       - Cinemas
 *     summary: Lấy thông tin chi tiết của một rạp chiếu phim
 *     operationId: getOneCinema
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của rạp chiếu phim
 *     responses:
 *       200:
 *         description: Lấy thông tin rạp chiếu phim thành công
 *       404:
 *         description: Không tìm thấy rạp chiếu phim với ID đã cung cấp
 *       500:
 *         description: Lỗi máy chủ
 *   patch:
 *     tags:
 *       - Cinemas
 *     summary: Cập nhật thông tin rạp chiếu phim
 *     operationId: updateCinema
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của rạp chiếu phim
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên rạp chiếu phim
 *               province:
 *                 type: string
 *                 description: Địa chỉ rạp
 *               district:
 *                 type: string
 *                 description: Quận huyện của rạp
 *               ward:
 *                 type: string
 *                 description: Phường xã của rạp
 *               address:
 *                 type: string
 *                 description: Địa chỉ chi tiết của rạp
 *               description:
 *                 type: string
 *                 description: Mô tả về rạp
 *     responses:
 *       200:
 *         description: Cập nhật thông tin rạp chiếu phim thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy rạp chiếu phim với ID đã cung cấp
 *       500:
 *         description: Lỗi máy chủ
 *   delete:
 *     tags:
 *       - Cinemas
 *     summary: Xóa rạp chiếu phim
 *     operationId: deleteCinema
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của rạp chiếu phim
 *     responses:
 *       204:
 *         description: Xóa rạp chiếu phim thành công
 *       404:
 *         description: Không tìm thấy rạp chiếu phim với ID đã cung cấp
 *       500:
 *         description: Lỗi máy chủ
 */
router
  .route("/:id")
  .get(cinemaController.getOneCinema)
  .patch(cinemaController.updateCinema)
  .delete(cinemaController.deleteCinema);

module.exports = router;
