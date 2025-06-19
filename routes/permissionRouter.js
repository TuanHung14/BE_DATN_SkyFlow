const express = require("express");
const permissionController = require("../controller/permissionController");
const router = express.Router();
/**
 * @swagger
 * /api/v1/permissions:
 *   get:
 *     tags:
 *       - Permission
 *     summary: Lấy danh sách tất cả quyền hạn
 *     operationId: getAllPermissions
 *     responses:
 *       200:
 *         description: Danh sách quyền hạn
 */
router.get("/", permissionController.getAllPermission);

module.exports = router;