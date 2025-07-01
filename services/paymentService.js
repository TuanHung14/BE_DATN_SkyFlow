const { createMomoPayment, verifyMomoCallback } = require("./momoGateway");
const { createVNPayPayment, verifyVNPayCallback } = require("./vnpayGateway");
const { createStripePayment } = require("./stripeGateway");
const { createZaloPayPayment, verifyZaloPayCallback} = require("./zalopayGateway");
const createPaymentByGateway = async (gateway, paymentData) => {
  switch (gateway) {
    case "momo":
      return await createMomoPayment(paymentData);
    case "vnpay":
      return await createVNPayPayment(paymentData);
    case "stripe":
      // return await createStripePayment(paymentData);
    case "zalopay":
        return await createZaloPayPayment(paymentData);
  }
};

const verifyCallbackByGateway = (gateway, callbackData) => {
  switch (gateway) {
    case "momo":
      return verifyMomoCallback(callbackData);
    case "vnpay":
      return verifyVNPayCallback(callbackData);
    case "zalopay":
      return verifyZaloPayCallback(callbackData);
  }
};

module.exports = {
  createPaymentByGateway,
  verifyCallbackByGateway,
};
