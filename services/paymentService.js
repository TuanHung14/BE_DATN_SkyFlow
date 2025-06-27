const { createMomoPayment, verifyMomoCallback } = require("./momoGateway");
const { createVNPayPayment, verifyVNPayCallback } = require("./vnpayGateway");
// const { createZaloPayPayment } = require("./stripeGateway");
const { createStripePayment } = require("./stripeGateway");
const createPaymentByGateway = async (gateway, paymentData) => {
  switch (gateway) {
    case "momo":
      return await createMomoPayment(paymentData);
    case "vnpay":
      return await createVNPayPayment(paymentData);
    case "stripe":
      return await createStripePayment(paymentData);
  }
};

const verifyCallbackByGateway = (gateway, callbackData) => {
  switch (gateway) {
    case "momo":
      return verifyMomoCallback(callbackData);
    case "vnpay":
      return verifyVNPayCallback(callbackData);
    // case "zalopay":
    //   return verifyZaloPayCallback(callbackData);
  }
};

module.exports = {
  createPaymentByGateway,
  verifyCallbackByGateway,
};
