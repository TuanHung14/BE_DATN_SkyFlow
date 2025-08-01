const express = require("express");
const roleController = require("../controller/roleController");
const auth = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorizeMiddleware");
const { Resource} = require("../model/permissionModel");
const { getRBACOnResorce } = require("../utils/helper");
const permissions = getRBACOnResorce(Resource.Role);

const router = express.Router();

router.use(auth)

/**
 * @swagger
 * /api/v1/roles/toogle/{id}:
 *   put:
 *     tags:
 *       - Role
 *     summary: Chuyển đổi trạng thái isDefault của vai trò
 *     operationId: toggleRoleIsDefault
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của vai trò cần chuyển đổi
 *     responses:
 *       200:
 *         description: Chuyển đổi isDefault thành công
 *       400:
 *         description: ID không hợp lệ hoặc vai trò không tồn tại
 *       401:
 *         description: Không được phép truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.put("/toogle/:id", authorize(permissions['update']), roleController.toggleIsDefault);

/**
 * @swagger
 * /api/v1/roles:
 *   get:
 *     tags:
 *       - Role
 *     summary: Lấy danh sách tất cả vai trò
 *     operationId: getAllRoles
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Danh sách các vai trò
 */
router.get("/", authorize(permissions['read']), roleController.findAllRole);

/**
 * @swagger
 * /api/v1/roles:
 *   post:
 *     tags:
 *       - Role
 *     summary: Tạo vai trò mới
 *     operationId: createRole
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
 *               - displayName
 *             properties:
 *               name:
 *                 type: string
 *                 example: "admin"
 *               displayName:
 *                 type: string
 *                 example: "Quản trị viên"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               permission:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "684bf7b55870d0d7bd8441cb"
 *     responses:
 *       201:
 *         description: Vai trò được tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post("/", authorize(permissions['create']), roleController.createRole);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   get:
 *     tags:
 *       - Role
 *     summary: Lấy chi tiết một vai trò
 *     operationId: getRoleById
 *     security:
 *       - bearer: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của vai trò
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết vai trò
 *       404:
 *         description: Không tìm thấy vai trò
 */
router.get("/:id", roleController.findOneRole);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   patch:
 *     tags:
 *       - Role
 *     summary: Cập nhật thông tin vai trò
 *     operationId: updateRole
 *     security:
 *       - bearer: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của vai trò cần cập nhật
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
 *                 example: "editor"
 *               displayName:
 *                 type: string
 *                 example: "Biên tập viên"
 *               isActive:
 *                 type: boolean
 *                 example: false
 *               permission:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "684bf7b55870d0d7bd8441cb"
 *     responses:
 *       200:
 *         description: Cập nhật vai trò thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy vai trò
 */
router.patch("/:id", authorize(permissions['update']), roleController.updateRole);

module.exports = router;