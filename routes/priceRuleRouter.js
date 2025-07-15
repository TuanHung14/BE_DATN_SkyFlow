const express = require('express');
const priceRuleController = require('../controller/priceRuleController');
const auth = require('../middleware/authMiddleware');
const authorize = require("../middleware/authorizeMiddleware");
const { Resource} = require("../model/permissionModel");
const { getRBACOnResorce } = require("../utils/helper");
const permissions = getRBACOnResorce(Resource.PriceRule);

const router = express.Router();

router.use(auth);

/**
 * @swagger
 * /api/v1/price-rules:
 *   post:
 *     tags:
 *       - Price Rules
 *     summary: Tạo quy tắc giá mới
 *     security:
 *       - bearer: []
 *     operationId: createPriceRule
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - seatType
 *               - formats
 *               - price
 *             properties:
 *               seatType:
 *                 type: string
 *                 example: "vip"
 *               formats:
 *                 type: string
 *                 example: 682abe49ab5bb018690c1219
 *               price:
 *                 type: number
 *                 example: 100000
 *     responses:
 *       201:
 *         description: Tạo quy tắc giá thành công
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 */
router.post('/', authorize(permissions['create']) ,priceRuleController.createPriceRule);

/**
 * @swagger
 * /api/v1/price-rules:
 *   get:
 *     tags:
 *       - Price Rules
 *     summary: Lấy tất cả các quy tắc giá
 *     operationId: getAllPriceRules
 *     responses:
 *       200:
 *         description: Danh sách quy tắc giá
 */
router.get('/', authorize(permissions['read']) ,priceRuleController.getAllPriceRules);

/**
 * @swagger
 * /api/v1/price-rules/{id}:
 *   patch:
 *     tags:
 *       - Price Rules
 *     summary: Cập nhật một quy tắc giá
 *     operationId: updatePriceRule
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của quy tắc giá
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               seatType:
 *                 type: string
 *               formats:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy quy tắc giá
 */
router.patch('/:id', authorize(permissions['update']) ,priceRuleController.updatePriceRule);

module.exports = router;