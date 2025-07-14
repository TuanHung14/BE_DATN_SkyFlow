const express = require("express");
const foodController = require("../controller/foodController");
const auth = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorizeMiddleware");
const { Resource} = require("../model/permissionModel");
const { getRBACOnResorce } = require("../utils/helper");
const permissions = getRBACOnResorce(Resource.Food);

const router = express.Router();

router.use(auth);

/**
 * @swagger
 * tags:
 *   name: Foods
 *   description: Quản lý thông tin món ăn
 */

/**
 * @swagger
 * /api/v1/food:
 *   get:
 *     summary: Lấy tất cả món ăn
 *     tags: [Foods]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Số lượng mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách món ăn
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   type:
 *                     type: string
 *                   price:
 *                     type: number
 *                   imageUrl:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 */
router.get("/", foodController.getAllFoods);

/**
 * @swagger
 * /api/v1/food/{id}:
 *   get:
 *     summary: Lấy thông tin món ăn theo ID
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của món ăn
 *     responses:
 *       200:
 *         description: Chi tiết món ăn
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 type:
 *                   type: string
 *                 price:
 *                   type: number
 *                 imageUrl:
 *                   type: string
 *                 description:
 *                   type: string
 *                 status:
 *                   type: string
 *       404:
 *         description: Không tìm thấy món ăn
 */
router.get("/:id", foodController.getFoodById);

/**
 * @swagger
 * /api/v1/food:
 *   post:
 *     summary: Thêm món ăn mới
 *     tags: [Foods]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [food, drinks, Combo]
 *               price:
 *                 type: number
 *               imageUrl:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *             example:
 *               name: Trà sữa truyền thống
 *               type: drinks
 *               price: 30000
 *               imageUrl: https://example.com/trasua.jpg
 *               description: Trà sữa ngon, giá hợp lý
 *               status: active
 *     responses:
 *       201:
 *         description: Tạo món ăn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 type:
 *                   type: string
 *                 price:
 *                   type: number
 *                 imageUrl:
 *                   type: string
 *                 description:
 *                   type: string
 *                 status:
 *                   type: string
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post("/", authorize(permissions['create']) ,foodController.createFood);

/**
 * @swagger
 * /api/v1/food/{id}:
 *   patch:
 *     summary: Cập nhật món ăn
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID món ăn
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
 *               price:
 *                 type: number
 *               imageUrl:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *             example:
 *               name: Cập nhật món ăn
 *               type: food
 *               price: 50000
 *               imageUrl: https://example.com/updated.jpg
 *               description: Mô tả mới cho món ăn
 *               status: active
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 type:
 *                   type: string
 *                 price:
 *                   type: number
 *                 imageUrl:
 *                   type: string
 *                 description:
 *                   type: string
 *                 status:
 *                   type: string
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy món ăn
 */
router.patch("/:id", authorize(permissions['update']) ,foodController.updateFood);

/**
 * @swagger
 * /api/v1/food/{id}:
 *   delete:
 *     summary: Xóa món ăn theo ID
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID món ăn
 *     responses:
 *       204:
 *         description: Xóa thành công, không có nội dung trả về
 *       404:
 *         description: Không tìm thấy món ăn
 */
router.delete("/:id", authorize(permissions['delete']) ,foodController.deleteFood);

module.exports = router;
