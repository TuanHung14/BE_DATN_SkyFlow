const express = require('express');
const movieEntityController = require('../controller/movieEntityController');
const auth = require('../middleware/authMiddleware');
const {checkDuplicateName} = require("../controller/movieEntityController");
const authorizers = require('../middleware/authorizeMiddleware');
const { Resource} = require('../model/permissionModel');
const { getRBACOnResorce } = require("../utils/helper");
const permissions = getRBACOnResorce(Resource.MovieEntites);

const router = express.Router();

router.use(auth);

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
 *                 example: "Kinh dị"
 *                 description: "Tên của thực thể phim"
 *               type:
 *                 type: string
 *                 example: genre | director | cast
 *                 description: "Loại thực thể, chọn một giá trị từ danh sách"
 *     responses:
 *       201:
 *         description: Tạo thực thể thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 */
router.post('/', authorizers(permissions['create']), checkDuplicateName ,movieEntityController.createMovieEntity);

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
 *           minimum: 1
 *         description: Số trang cần hiển thị
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *           minimum: 1
 *           maximum: 100
 *         description: Số lượng kết quả trên mỗi trang
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sắp xếp kết quả (Ví dụ -createdAt,+name. Dấu - để sắp xếp giảm dần, + để sắp xếp tăng dần)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [genre, director, cast]
 *         description: Lọc theo loại thực thể
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *           pattern: ^.*$
 *         description: Tìm kiếm theo tên
 *     responses:
 *       200:
 *         description: Lấy danh sách thực thể thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: number
 *                   example: 10
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "65f2d6789abcdef01234567"
 *                           name:
 *                             type: string
 *                             example: "Kinh dị"
 *                           type:
 *                             type: string
 *                             enum: [genre, director, cast]
 *                             example: "genre"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: Bad request - Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Invalid input data
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Internal server error
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
 *               type:
 *                 type: string
 *                 example: "genre"
 *                 description: "Kiểu mới của thực thể phim (nếu muốn cập nhật)"
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
 *                 name:
 *                   type: string
 *                   example: "Updated Movie Name"
 *                 type:
 *                   type: string
 *                   example: "genre"
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
router.patch('/:id', authorizers(permissions['update']), checkDuplicateName ,movieEntityController.updateMovieEntity);

/**
 * @swagger
 * /api/v1/movie-entities/{id}:
 *   delete:
 *     tags:
 *       - Movie Entities
 *     summary: Xóa thực thể phim (xoá mềm)
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
router.delete('/:id', authorizers(permissions['delete']) ,movieEntityController.deleteMovieEntity);

module.exports = router;