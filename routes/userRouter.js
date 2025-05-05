const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');

const {auth, restrictTo} = require('../middleware/authMiddleware');


const router = express.Router();
/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     tags:
 *       - Users
 *     summary: Login for users
 *     description: Authenticate user and return token
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
router.post('/login', authController.login);

/**
 * @swagger
 * /api/v1/users/signup:
 *   post:
 *     tags:
 *       - Users
 *     summary: Signup for users
 *     description: Create a new user
 *     operationId: signupUser
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: 
 *               - name
 *               - email   
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: user123
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
router.post('/signup', authController.signup);

/**
 * @swagger
 * /api/v1/users/loginGoogle:
 *   post:
 *     tags:
 *       - Users
 *     summary: Login with Google
 *     description: Authenticate user using Google OAuth token
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
router.post('/loginGoogle', authController.googleLogin);

/**
 * @swagger
 * /api/v1/users/forgotPassword:
 *   post:
 *     tags:
 *       - Users
 *     summary: Gửi OTP quên mật khẩu
 *     description: Gửi mã OTP đến email của người dùng để đặt lại mật khẩu
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
router.post('/forgotPassword', authController.forgotPassword);

/**
 * @swagger
 * /api/v1/users/resetPassword/{token}:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Đặt lại mật khẩu
 *     description: Đặt lại mật khẩu mới bằng cách cung cấp email, mật khẩu mới và token được gửi qua email
 *     operationId: resetPassword
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         description: Token được gửi qua email để xác thực đặt lại mật khẩu
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
router.patch('/resetPassword/:token', authController.resetPassword);

/**
 * @swagger
 * /api/v1/users/refreshToken:
 *   get:
 *     tags:
 *       - Users
 *     summary: Làm mới access token
 *     description: Dùng refresh token trong cookie để tạo access token mới
 *     operationId: refreshToken
 *     responses:
 *       200:
 *         description: Refresh token thành công, access token mới được trả về trong response
 *       401:
 *         description: Không có refresh token hoặc token không hợp lệ
 */
router.get('/refreshToken', authController.refreshToken);


// Protect all routes after this middleware
router.use(auth);

/**
 * @swagger
 * /api/v1/users/logout:
 *   post:
 *     tags:
 *       - Users
 *     summary: Logout user
 *     description: Clears the refreshToken cookie and invalidates the session
 *     security:
 *       - bearer: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /api/v1/users/updateMyPassword:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Cập nhật mật khẩu người dùng
 *     description: Cho phép người dùng đã đăng nhập cập nhật mật khẩu của họ
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
router.patch('/updateMyPassword', authController.updatePassword);

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Lấy thông tin người dùng hiện tại
 *     description: Trả về thông tin chi tiết của người dùng đã đăng nhập
 *     operationId: getMe
 *     security:
 *       - bearer: []
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/me', userController.getMe, userController.getUser);

/**
 * @swagger
 * /api/v1/users/updateMe:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Cập nhật thông tin cá nhân
 *     description: Cho phép người dùng đã đăng nhập cập nhật thông tin cá nhân của họ (không bao gồm mật khẩu)
 *     operationId: updateMe
 *     security:
 *       - bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên người dùng
 *               email:
 *                 type: string
 *                 description: Email của người dùng
 *               photo:
 *                 type: string
 *                 description: Ảnh đại diện của người dùng
 *               phone:
 *                 type: string
 *                 description: Số điện thoại của người dùng
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: Ngày sinh của người dùng
 *     responses:
 *       200:
 *         description: Cập nhật thông tin thành công
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc cố gắng cập nhật mật khẩu (nên sử dụng /updateMyPassword)
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.patch('/updateMe',userController.updateMe);
// router.delete('/deleteMe', userController.deleteMe);

// router.use(restrictTo('admin'));
/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Lấy danh sách người dùng
 *     description: Trả về danh sách tất cả người dùng với các tùy chọn lọc, sắp xếp, giới hạn trường và phân trang
 *     operationId: getAllUsers
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang cần hiển thị
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng kết quả trên mỗi trang
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sắp xếp kết quả (ví dụ sort=name,-createdAt)
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: Giới hạn trường được trả về (ví dụ fields=name,email,phone)
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin, sub_admin]
 *         description: Lọc theo role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [inactive, active]
 *         description: Lọc theo trạng thái
 *     responses:
 *       200:
 *         description: Lấy danh sách người dùng thành công
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.route('/').get(userController.getAllUsers);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Lấy thông tin người dùng theo ID
 *     description: Trả về thông tin chi tiết của một người dùng dựa trên ID
 *     operationId: getUser
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng cần lấy thông tin
 *     responses:
 *       200:
 *         description: Lấy thông tin người dùng thành công
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 *       404:
 *         description: Không tìm thấy người dùng với ID đã cung cấp
 *       500:
 *         description: Lỗi máy chủ
 *   patch:
 *     tags:
 *       - Users
 *     summary: Cập nhật thông tin người dùng theo ID
 *     description: Cập nhật thông tin người dùng dựa trên ID (chỉ cho phép cập nhật name và email)
 *     operationId: updateUser
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên người dùng
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email của người dùng
 *               role:
 *                 type: string
 *                 description: role
 *     responses:
 *       200:
 *         description: Cập nhật thông tin người dùng thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 *       404:
 *         description: Không tìm thấy người dùng với ID đã cung cấp
 *       500:
 *         description: Lỗi máy chủ
 */
router.route('/:id').get(userController.getUser).patch(userController.fieldUpdate,userController.updateUser);

module.exports = router;