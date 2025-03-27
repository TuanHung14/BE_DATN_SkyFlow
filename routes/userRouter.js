const express = require('express');
// eslint-disable-next-line import/newline-after-import
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
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 60d21b4667d0d8992e610c85
 *                     username:
 *                       type: string
 *                       example: user123
 *       400:
 *         description: Invalid username/password
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Server error
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
 *               - passwordConfirmation
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
 *               passwordConfirmation:
 *                 type: string
 *                 format: password
 *                 example: test1234
 *     responses:
 *       200:
 *         description: Successful signup
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 60d21b4667d0d8992e610c85
 *                     username:
 *                       type: string
 *                       example: user123
 *       400:
 *         description: Invalid username/password
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Server error
 */
router.post('/signup', authController.signup);
router.post('/loginGoogle', authController.googleLogin);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.get('/refreshToken', authController.refreshToken);


// Protect all routes after this middleware
router.use(auth);

router.post('/logout', authController.logout);

router.patch('/updateMyPassword', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe',userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

router.use(restrictTo('admin'));

router.route('/').get(userController.getAllUsers);
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;