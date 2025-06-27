const express = require('express');
const ticketController = require('../controller/ticketController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.use(auth);

router.post('/', auth, ticketController.createTicket);

module.exports = router;