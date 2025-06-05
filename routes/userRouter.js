const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');

const {auth, restrictTo} = require('../middleware/authMiddleware');


const router = express.Router();


// Protect all routes after this middleware
router.use(auth);

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Lấy thông tin người dùng hiện tại
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
 * /api/v1/users/:
 *   post:
 *     tags:
 *       - Users
 *     summary: Đăng ký người dùng mới
 *     operationId: createUser
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
 *               password:
 *                 type: string
 *                 description: Mật khẩu của người dùng
 *               role:
 *                 type: string
 *                 enum: [user, admin, sub_admin]
 *     responses:
 *       201:
 *         description: Người dùng được tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc đã tồn tại email
 */
router.post('/', userController.fieldCreate, userController.createUser);

/**
 * @swagger
 * /api/v1/users/updateMe:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Cập nhật thông tin cá nhân
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
 *     operationId: getUser
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *     operationId: updateUser
 *     security:
 *       - bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
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