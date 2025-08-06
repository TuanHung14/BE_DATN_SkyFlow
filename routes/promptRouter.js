const express = require('express');
const promptController = require('../controller/promptController');
const router = express.Router();

/**
 * @swagger
 * /api/v1/prompts:
 *   get:
 *     summary: Lấy danh sách prompt
 *     tags: [Prompts]
 *     responses:
 *       200:
 *         description: Lấy thành công
 */
router.get('/' , promptController.fieldClient, promptController.getPrompt);

module.exports = router;