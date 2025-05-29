const epress = require('express');
const paymentController = require('../controller/paymentController');

const router = epress.Router();

router.post('/', paymentController.createPayment)
router.post('/callback/momo', paymentController.momoCallback);
router.post('/query/momo', paymentController.queryMomoPayment);


module.exports = router;