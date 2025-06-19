const express = require('express');
const chatAIController = require('../controller/chatAIController')

const router = express.Router();

/**
 * @swagger
 * /api/v1/chatAI:
 *   post:
 *     tags:
 *       - Chat AI
 *     summary: Gửi câu hỏi đến AI và nhận phản hồi
 *     operationId: chatWithAI
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Câu hỏi hoặc tin nhắn gửi đến AI
 *                 example: "Xin chào AI hỗ trợ"
 *     responses:
 *       200:
 *         description: Phản hồi từ AI
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       500:
 *         description: Lỗi từ server hoặc AI
 */
router.post("/", chatAIController.chatAI);

module.exports = router;