const express = require("express");
const roleController = require("../controller/roleController");
const router = express.Router();

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
router.get("/", roleController.findAllRole);

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
router.post("/", roleController.createRole);

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
router.patch("/:id", roleController.updateRole);

module.exports = router;