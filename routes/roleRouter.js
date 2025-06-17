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

router.get("/:id", roleController.findOneRole);

router.patch("/:id", roleController.updateRole);

module.exports = router;