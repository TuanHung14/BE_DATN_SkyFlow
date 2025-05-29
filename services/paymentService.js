const {createMomoPayment, verifyMomoCallback} = require('./gateways/momoGateway');

const createPaymentByGateway = async (gateway, paymentData) => {
    switch (gateway) {
        case 'momo':
            return await createMomoPayment(paymentData);
        // case 'vnpay':
        //     return await createVNPayPayment(paymentData);
        // case 'zalopay':
        //     return await createZaloPayPayment(paymentData);
    }
};

const verifyCallbackByGateway = (gateway, callbackData) => {
    switch (gateway) {
        case 'momo':
            return verifyMomoCallback(callbackData);
        // case 'vnpay':
        //     return verifyVNPayCallback(callbackData);
        // case 'zalopay':
        //     return verifyZaloPayCallback(callbackData);
    }
};

module.exports = {
    createPaymentByGateway,
    verifyCallbackByGateway
};