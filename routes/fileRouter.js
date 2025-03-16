const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const {uploadFile} = require('../controller/fileController');

//GET /api/v1/users

router.use(auth, uploadMiddleware.array('images', 10));
router.post('/upload', uploadFile)

module.exports = router;