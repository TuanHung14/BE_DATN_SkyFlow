const express = require('express');
const seatController = require('../controller/seatController');
const router = express.Router();

router.get("/", seatController.getAllSeat);
router.post("/", seatController.createSeat);
router.patch("/edit", seatController.updateSeat);

module.exports = router;