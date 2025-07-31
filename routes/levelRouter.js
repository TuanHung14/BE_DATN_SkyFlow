const express = require('express');
const levelController = require('../controller/levelController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', levelController.getFieldGetClient, levelController.getAllLevels)

router.use(auth);

router.put('/toggle/:id', levelController.toggleIsDefault);

router.route('/admin')
    .get(levelController.getAllLevels)
    .post(levelController.createLevel);

router.route('/:id')
    .get(levelController.getLevelById)
    .patch(levelController.updateLevel)

module.exports = router;

