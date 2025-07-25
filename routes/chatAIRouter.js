const express = require('express');
const chatAIController = require('../controller/chatAIController')
const auth = require('../middleware/authMiddleware');
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
 *               - sessionId
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Câu hỏi hoặc tin nhắn gửi đến AI
 *                 example: "Xin chào AI hỗ trợ"
 *               sessionId:
 *                 type: string
 *                 description: sessionId để quản lý phiên trò chuyện
 *     responses:
 *       200:
 *         description: Phản hồi từ AI
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       500:
 *         description: Lỗi từ server hoặc AI
 */
router.post("/", chatAIController.chatAI);

/**
 * @swagger
 * /api/v1/chatAI/history/{sessionId}:
 *   get:
 *     tags:
 *       - Chat AI
 *     summary: Lấy lịch sử trò chuyện từ Redis theo sessionId
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Mã phiên trò chuyện
 *     responses:
 *       200:
 *         description: Lịch sử trò chuyện đã lưu
 *       404:
 *         description: Không tìm thấy lịch sử
 *       500:
 *         description: Lỗi server
 */
router.get("/history/:sessionId", chatAIController.getChatHistory);

/**
 * @swagger
 * /api/v1/chatAI/{id}/{sessionId}:
 *   get:
 *     tags:
 *       - Chat AI
 *     summary: Gửi prompt có sẵn theo ID để nhận phản hồi từ AI
 *     operationId: chatWithAIByPromptId
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của prompt trong hệ thống
 *         schema:
 *           type: string
 *       - name: sessionId
 *         in: path
 *         required: true
 *         description: sessionId để quản lý phiên trò chuyện
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Phản hồi từ AI dựa trên prompt đã lưu
 *       400:
 *         description: Prompt không hợp lệ hoặc không tồn tại
 *       500:
 *         description: Lỗi từ server hoặc AI
 */
router.get("/:id/:sessionId", chatAIController.chatAIByPrompt);

router.post("/generate-review", auth, chatAIController.generateReview);

module.exports = router;