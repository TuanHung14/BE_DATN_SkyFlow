const express = require('express');
const statisticController = require('../controller/statisticController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.use(auth);

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: Thống kê hệ thống

 * /api/v1/statistics/summary:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Lấy thống kê tổng quan
 *     operationId: getSummary
 *     security:
 *       - bearer: []
 *     responses:
 *       200:
 *         description: Trả về thông tin tổng quan (số lượng người dùng, vé bán ra, doanh thu, v.v.)
 *       401:
 *         description: Chưa xác thực

 * /api/v1/statistics/revenue:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Lấy doanh thu theo thời gian (tuần hoặc tháng)
 *     operationId: getRevenueByTime
 *     security:
 *       - bearer: []
 *     parameters:
 *       - name: type
 *         in: query
 *         description: Kiểu thống kê (week hoặc month)
 *         required: false
 *         schema:
 *           type: string
 *           enum: [week, month]
 *           example: "month"
 *     responses:
 *       200:
 *         description: Trả về dữ liệu doanh thu theo thời gian
 *       400:
 *         description: Tham số không hợp lệ
 *       401:
 *         description: Chưa xác thực

 * /api/v1/statistics/top-movies:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Lấy danh sách các phim bán chạy nhất
 *     operationId: getTopMovies
 *     security:
 *       - bearer: []
 *     responses:
 *       200:
 *         description: Trả về danh sách phim được đặt vé nhiều nhất
 *       401:
 *         description: Chưa xác thực
 */

// Lấy thống kê tổng quan
router.get('/summary', statisticController.getSummary);

// Lấy doanh thu theo tháng hoặc theo tuần
router.get('/revenue', statisticController.getRevenueByTime);

// Lấy những bộ phim được mua vé nhiều nhất
router.get('/top-movies', statisticController.getTopMovies);

module.exports = router;