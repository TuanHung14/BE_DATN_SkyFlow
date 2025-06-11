const express = require('express');
const seatController = require('../controller/seatController');
const router = express.Router();

router.get('/', seatController.getAllSeats);
router.post('/', seatController.createSeat);

module.exports = router;