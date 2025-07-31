const express = require('express');
const rewardsController = require('../controller/rewardsController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', rewardsController.getFieldGetClient, rewardsController.getAllRewards);

router.use(auth);

router.get('/spin', rewardsController.spinReward);

router.route('/admin')
    .get(rewardsController.getAllRewards)
    .post(rewardsController.createReward);

router.route('/:id')
    .get(rewardsController.getRewardById)
    .patch(rewardsController.updateReward);
