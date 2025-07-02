const { createMomoPayment, verifyMomoCallback } = require("./momoGateway");
const { createVNPayPayment, verifyVNPayCallback } = require("./vnpayGateway");
const { createZaloPayPayment, verifyZaloPayCallback} = require("./zalopayGateway");
const createPaymentByGateway = async (gateway, paymentData) => {
  switch (gateway) {
    case "Momo":
      return await createMomoPayment(paymentData);
    case "Vnpay":
      return await createVNPayPayment(paymentData);
    case "Zalopay":
        return await createZaloPayPayment(paymentData);
  }
};

const verifyCallbackByGateway = async (gateway, callbackData) => {
  switch (gateway) {
    case "momo":
      return await verifyMomoCallback(callbackData);
    case "vnpay":
      return await verifyVNPayCallback(callbackData);
    case "zalopay":
      return await verifyZaloPayCallback(callbackData);
  }
};

module.exports = {
  createPaymentByGateway,
  verifyCallbackByGateway,
};
