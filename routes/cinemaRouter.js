const express = require("express");
const cinemaController = require("../controller/cinemaController");
const auth = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuthMiddleware");
const authorize = require("../middleware/authorizeMiddleware");
const { Resource } = require("../model/permissionModel");
const { getRBACOnResorce } = require("../utils/helper");
const permissions = getRBACOnResorce(Resource.Cinema);

const router = express.Router();

// router.use(auth);

/**
 * @swagger
 * components:
 *   schemas:
 *     Location:
 *       type: object
 *       required:
 *         - type
 *         - coordinates
 *       properties:
 *         type:
 *           type: string
 *           enum: [Point]
 *         coordinates:
 *           type: array
 *           items:
 *             type: number
 *           description: [lng, lat]
 *     AddressObject:
 *       type: object
 *       required:
 *         - label
 *         - value
 *       properties:
 *         label:
 *           type: string
 *         value:
 *           type: string
 */

router.get(
  "/distances/:unit",
  optionalAuth,
  cinemaController.getNearestCinemas
);

/**
 * @swagger
 * /api/v1/cinemas/show-times:
 *   get:
 *     tags:
 *       - Cinemas
 *     summary: Hiển thị các rạp có suất chiếu theo bộ lọc
 *     operationId: getFilteredCinemas
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: movieId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 *       500:
 *         description: Lỗi server
 */
router.get("/show-times", cinemaController.getFilteredCinemas);
/**
 * @swagger
 * /api/v1/cinemas/getShowtimesByCinemaByDate:
 *   get:
 *     tags:
 *       - Cinemas
 *     summary: Lấy danh sách phim tại rạp theo ngày cụ thể
 *     operationId: getMoviesByCinemaByDate
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: query
 *         name: cinemaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của rạp chiếu
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày muốn xem suất chiếu (định dạng yyyy-mm-dd)
 *     responses:
 *       200:
 *         description: Thành công
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
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: 2025-08-01
 *                     movies:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Thiếu cinemaId hoặc date không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.get(
  "/getShowtimesByCinemaByDate",
  cinemaController.getShowtimesByCinemaByDate
);

/**
 * @swagger
 * /api/v1/cinemas/admin:
 *   get:
 *     tags:
 *       - Cinemas
 *     summary: Lấy danh sách rạp (admin)
 *     operationId: getAllCinemasAdmin
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
 *         name: search[name]
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 *       500:
 *         description: Lỗi server
 */
router.get(
  "/admin",
  auth,
  authorize(permissions["read"]),
  cinemaController.getAllCinemas
);

/**
 * @swagger
 * /api/v1/cinemas:
 *   get:
 *     tags:
 *       - Cinemas
 *     summary: Lấy tất cả rạp chiếu
 *     operationId: getAllCinemas
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thành công
 *       500:
 *         description: Lỗi server
 *   post:
 *     tags:
 *       - Cinemas
 *     summary: Tạo rạp chiếu mới
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
 *               - description
 *               - province
 *               - district
 *               - ward
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               description:
 *                 type: string
 *               phone:
 *                 type: string
 *               img:
 *                 type: array
 *                 items:
 *                   type: string
 *               province:
 *                 $ref: '#/components/schemas/AddressObject'
 *               district:
 *                 $ref: '#/components/schemas/AddressObject'
 *               ward:
 *                 $ref: '#/components/schemas/AddressObject'
 *               location:
 *                 $ref: '#/components/schemas/Location'
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Lỗi dữ liệu
 *       500:
 *         description: Lỗi server
 */
router
  .route("/")
  .get(cinemaController.getAllCinemas)
  .post(auth, authorize(permissions["create"]), cinemaController.createCinema);

/**
 * @swagger
 * /api/v1/cinemas/{id}:
 *   get:
 *     tags:
 *       - Cinemas
 *     summary: Lấy chi tiết 1 rạp
 *     operationId: getOneCinema
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
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy
 *   patch:
 *     tags:
 *       - Cinemas
 *     summary: Cập nhật rạp
 *     operationId: updateCinema
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
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               description:
 *                 type: string
 *               phone:
 *                 type: string
 *               img:
 *                 type: array
 *                 items:
 *                   type: string
 *               province:
 *                 $ref: '#/components/schemas/AddressObject'
 *               district:
 *                 $ref: '#/components/schemas/AddressObject'
 *               ward:
 *                 $ref: '#/components/schemas/AddressObject'
 *               location:
 *                 $ref: '#/components/schemas/Location'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Lỗi dữ liệu
 *       404:
 *         description: Không tìm thấy
 *   delete:
 *     tags:
 *       - Cinemas
 *     summary: Xóa rạp
 *     operationId: deleteCinema
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
 *         description: Không tìm thấy
 */
router
  .route("/:id")
  .get(cinemaController.getOneCinema)
  .patch(auth, authorize(permissions["update"]), cinemaController.updateCinema)
  .delete(
    auth,
    authorize(permissions["delete"]),
    cinemaController.deleteCinema
  );

module.exports = router;
