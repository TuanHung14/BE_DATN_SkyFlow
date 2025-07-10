const express = require("express");
const authController = require("../controller/authController");
const  auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/sendMail", authController.sendEmail);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Đăng nhập tài khoản
 *     operationId: loginUser
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: loulou@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: test1234
 *     responses:
 *       201:
 *         description: Successful login
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Đăng ký tài khoản
 *     operationId: signupUser
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: test1234
 *     responses:
 *       201:
 *         description: Successful signup
 */
router.post("/signup", authController.signup);

/**
 * @swagger
 * /api/v1/auth/loginGoogle:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login Google
 *     operationId: loginGoogle
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid or expired Google token
 */
router.post("/loginGoogle", authController.googleLogin);

/**
 * @swagger
 * /api/v1/auth/loginFacebook:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login Facebook
 *     operationId: loginFacebook
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessToken
 *             properties:
 *               accessToken:
 *                 type: string
 *                 example: EAAGm0PX4ZCpsBAKZCq3ZBZBZAeZC...
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Missing or invalid access token
 *       401:
 *         description: Invalid or expired Facebook token
 */
router.post("/loginFacebook", authController.facebookLogin);

/**
 * @swagger
 * /api/v1/auth/forgotPassword:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Gửi OTP quên mật khẩu
 *     operationId: forgotPassword
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP đã được gửi đến email
 *       404:
 *         description: Không tìm thấy người dùng với email này
 *       401:
 *         description: Tài khoản chưa xác thực
 *       500:
 *         description: Lỗi khi gửi email
 */
router.post("/forgotPassword", authController.forgotPassword);

/**
 * @swagger
 * /api/v1/auth/resetPassword/{token}:
 *   patch:
 *     tags:
 *       - Auth
 *     summary: Đặt lại mật khẩu
 *     operationId: resetPassword
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: 0c6cfa8fe3b54f28958e36d84e7a145d
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Mật khẩu đã được đặt lại thành công
 *       400:
 *         description: Thiếu thông tin hoặc token không hợp lệ
 *       404:
 *         description: Không tìm thấy người dùng
 */
router.patch("/resetPassword/:token", authController.resetPassword);

/**
 * @swagger
 * /api/v1/auth/refreshToken:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Làm mới access token
 *     operationId: refreshToken
 *     responses:
 *       200:
 *         description: Refresh token thành công, access token mới được trả về trong response
 *       401:
 *         description: Không có refresh token hoặc token không hợp lệ
 */
router.get("/refreshToken", authController.refreshToken);

router.use(auth);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout user
 *     security:
 *       - bearer: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", authController.logout);

/**
 * @swagger
 * /api/v1/auth/updateMyPassword:
 *   patch:
 *     tags:
 *       - Auth
 *     summary: Cập nhật mật khẩu người dùng
 *     operationId: updateMyPassword
 *     security:
 *       - bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - password
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Mật khẩu hiện tại của người dùng
 *               password:
 *                 type: string
 *                 description: Mật khẩu mới của người dùng
 *     responses:
 *       200:
 *         description: Mật khẩu đã được cập nhật thành công, token mới được trả về
 *       401:
 *         description: Mật khẩu hiện tại không chính xác hoặc người dùng chưa đăng nhập
 *       500:
 *         description: Lỗi máy chủ
 */
router.patch("/updateMyPassword", authController.updatePassword);

/**
 * @swagger
 * /api/v1/auth/setMyPassword:
 *   patch:
 *     tags:
 *       - Auth
 *     summary: Đặt mật khẩu người dùng nếu người dùng login google
 *     operationId: setMyPassword
 *     security:
 *       - bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: Mật khẩu mới của người dùng
 *     responses:
 *       200:
 *         description: Mật khẩu đã được đặt thành công, token mới được trả về
 *       401:
 *         description: Người dùng không tồn tại | Người dùng đã có mật khẩu
 *       500:
 *         description: Lỗi máy chủ
 */
router.patch("/setMyPassword", authController.setPassword);

module.exports = router;
