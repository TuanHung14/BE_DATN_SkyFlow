const express = require('express');
const rewardsController = require('../controller/rewardsController');
const auth = require('../middleware/authMiddleware');
const {Resource} = require("../model/permissionModel");
const {getRBACOnResorce} = require("../utils/helper")
const authorize = require("../middleware/authorizeMiddleware");

const permissions = getRBACOnResorce(Resource.Rewards);

const router = express.Router();


/**
 * @swagger
 * /api/v1/rewards:
 *   get:
 *     summary: Lấy danh sách phần thưởng
 *     tags: [Rewards]
 *     responses:
 *       200:
 *         description: Lấy thành công
 */
router.get('/', rewardsController.getFieldGetClient, rewardsController.getAllRewards);

router.use(auth);

/**
 * @swagger
 * /api/v1/rewards/spin/{id}:
 *   post:
 *     summary: Quay phần thưởng (vòng quay may mắn)
 *     tags: [Rewards]
 *     security:
 *       - bearer: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID phần thưởng
 *     responses:
 *       200:
 *         description: Quay phần thưởng thành công
 *       400:
 *         description: Người dùng không đủ lượt quay hoặc lỗi logic
 *       401:
 *         description: Không xác thực
 */
router.post('/spin/:id', rewardsController.spinReward);

/**
 * @swagger
 * /api/v1/rewards/admin:
 *   get:
 *     summary: Lấy danh sách phần thưởng
 *     tags: [Rewards]
 *     security:
 *       - bearer: []
 *     responses:
 *       200:
 *         description: Lấy thành công
 */
/**
 * @swagger
 * /api/v1/rewards/admin:
 *   post:
 *     summary: Tạo phần thưởng mới
 *     tags: [Rewards]
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
 *               - probability
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Voucher 20K"
 *               type:
 *                 type: string
 *                 enum: [point, voucher]
 *                 example: "voucher"
 *               value:
 *                 type: number
 *                 description: Chỉ dùng khi type là "point"
 *                 example: 100
 *               voucherId:
 *                 type: string
 *                 description: Chỉ dùng khi type là "voucher"
 *                 example: "64f34c8a59e4ab001f3792fd"
 *               probability:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *                 example: 0.1
 *               active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Tạo phần thưởng thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.route('/admin')
    .get(authorize(permissions['read']), rewardsController.getAllRewards)
    .post(authorize(permissions['create']), rewardsController.createReward);

/**
 * @swagger
 * /api/v1/rewards/{id}:
 *   get:
 *     summary: Lấy chi tiết phần thưởng theo ID
 *     tags: [Rewards]
 *     security:
 *       - bearer: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID phần thưởng
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lấy thành công
 *       404:
 *         description: Không tìm thấy phần thưởng
 */
/**
 * @swagger
 * /api/v1/rewards/{id}:
 *   patch:
 *     summary: Cập nhật phần thưởng
 *     tags: [Rewards]
 *     security:
 *       - bearer: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID phần thưởng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [point, voucher]
 *               value:
 *                 type: number
 *                 description: Chỉ khi type là "point"
 *               voucherId:
 *                 type: string
 *                 description: Chỉ khi type là "voucher"
 *               probability:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy phần thưởng
 */
router.route('/:id')
    .get(authorize(permissions['read']), rewardsController.getRewardById)
    .patch(authorize(permissions['update']), rewardsController.updateReward);


module.exports = router;
