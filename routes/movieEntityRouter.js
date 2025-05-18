const express = require('express');
const movieEntityController = require('../controller/movieEntityController');
const { auth, restrictTo } = require('../middleware/authMiddleware');
const {checkDuplicateName} = require("../controller/movieEntityController")

const router = express.Router();

// router.use(auth);

/**
 * @swagger
 * /api/v1/movie-entities:
 *   post:
 *     tags:
 *       - Movie Entities
 *     summary: Tạo thực thể phim mới
 *     operationId: createMovieEntity
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
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 example: "The Dark Knight"
 *                 description: "Tên của thực thể phim"
 *               type:
 *                 type: string
 *                 example: genre
 *                 description: "Loại thực thể, chọn một giá trị từ danh sách"
 *     responses:
 *       201:
 *         description: Tạo thực thể thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 */
router.post('/', checkDuplicateName ,movieEntityController.createMovieEntity);

/**
 * @swagger
 * /api/v1/movie-entities:
 *   get:
 *     tags:
 *       - Movie Entities
 *     summary: Lấy danh sách thực thể phim
 *     operationId: getAllMovieEntities
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang cần hiển thị
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng kết quả trên mỗi trang
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sắp xếp kết quả
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: Giới hạn trường được trả về
 *     responses:
 *       200:
 *         description: Lấy danh sách thực thể thành công
 *       500:
 *         description: Lỗi server
 */
router.get('/', movieEntityController.getAllMovieEntities);

/**
 * @swagger
 * /api/v1/movie-entities/{id}:
 *   get:
 *     tags:
 *       - Movie Entities
 *     summary: Lấy thông tin thực thể phim theo ID
 *     operationId: getMovieEntityById
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lấy thực thể thành công
 *       404:
 *         description: Không tìm thấy thực thể
 *       500:
 *         description: Lỗi server
 */
router.get('/:id', movieEntityController.getMovieEntityById);

/**
 * @swagger
 * /api/v1/movie-entities/{id}:
 *   patch:
 *     tags:
 *       - Movie Entities
 *     summary: Cập nhật thông tin thực thể phim
 *     operationId: updateMovieEntity
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "ID của thực thể phim cần cập nhật. Để xem thông tin chi tiết của thực thể này trước khi cập nhật, sử dụng endpoint GET /api/v1/movie-entities/{id}."
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Movie Name"
 *                 description: "Tên mới của thực thể phim (nếu muốn cập nhật)"
 *               description:
 *                 type: string
 *                 example: "Updated movie description"
 *                 description: "Mô tả mới của thực thể phim (nếu muốn cập nhật)"
 *               releaseDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-03-20"
 *                 description: "Ngày phát hành mới của thực thể phim (nếu muốn cập nhật)"
 *             minProperties: 1
 *     responses:
 *       200:
 *         description: Cập nhật thực thể thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 name:
 *                   type: string
 *                   example: "Updated Movie Name"
 *                 description:
 *                   type: string
 *                   example: "Updated movie description"
 *                 releaseDate:
 *                   type: string
 *                   format: date
 *                   example: "2024-03-20"
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 *       404:
 *         description: Không tìm thấy thực thể
 */
router.patch('/:id', checkDuplicateName ,movieEntityController.updateMovieEntity);

/**
 * @swagger
 * /api/v1/movie-entities/{id}:
 *   delete:
 *     tags:
 *       - Movie Entities
 *     summary: Xóa thực thể phim
 *     operationId: deleteMovieEntity
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thực thể thành công
 *       404:
 *         description: Không tìm thấy thực thể
 *       500:
 *         description: Lỗi server
 */
router.delete('/:id', movieEntityController.deleteMovieEntity);

module.exports = router;