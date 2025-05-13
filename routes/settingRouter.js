/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Quản lý thông tin cấu hình hệ thống
 */

/**
 * @swagger
 * /api/v1/settings:
 *   get:
 *     summary: Lấy tất cả settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Danh sách settings
 */
router.get("/", settingController.getAllSettings);

/**
 * @swagger
 * /api/v1/settings/{id}:
 *   get:
 *     summary: Lấy 1 setting theo ID
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của setting
 *     responses:
 *       200:
 *         description: Thông tin setting
 */
router.get("/:id", settingController.getSettingById);

/**
 * @swagger
 * /api/v1/settings:
 *   post:
 *     summary: Tạo setting mới
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_name:
 *                 type: string
 *               address:
 *                 type: string
 *               contact_email:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               logo_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Setting đã được tạo
 */
router.post("/", settingController.createSetting);

/**
 * @swagger
 * /api/v1/settings/{id}:
 *   patch:
 *     summary: Cập nhật setting
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của setting
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_name:
 *                 type: string
 *               address:
 *                 type: string
 *               contact_email:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               logo_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đã cập nhật thành công
 */
router.patch("/:id", settingController.updateSetting);

/**
 * @swagger
 * /api/v1/settings/{id}:
 *   delete:
 *     summary: Xoá setting
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của setting
 *     responses:
 *       204:
 *         description: Xóa thành công
 */
router.delete("/:id", settingController.deleteSetting);
