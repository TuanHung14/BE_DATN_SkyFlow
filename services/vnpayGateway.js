const axios = require("axios");
const crypto = require("crypto");
const querystring = require("querystring");

const sortObject = (obj) => {
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});
};

exports.createVNPayPayment = async (paymentData, req) => {
  try {
    const {
      orderId,
      amount,
      orderInfo = `Thanh-toan-don-hang-${orderId}`,
    } = paymentData;
    const vnp_TmnCode = process.env.VNPAY_TMN_CODE;
    const vnp_HashSecret = process.env.VNPAY_SECRET_KEY;
    const vnp_Url =
      process.env.VNPAY_API_ENDPOINT ||
      "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    const returnUrl =
      process.env.VNPAY_RETURN_URL || "http://localhost:3000/vnpay/callback";

    if (!orderId || !amount || !vnp_TmnCode || !vnp_HashSecret) {
      throw new Error("Missing required parameters or environment variables");
    }

    const date = new Date();
    const createDate = date
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14);
    const vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode,
      vnp_Amount: amount * 100,
      vnp_CreateDate: createDate,
      vnp_CurrCode: "VND",
      vnp_IpAddr: req?.ip || "127.0.0.1",
      vnp_Locale: "vn",
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: "billpayment",
      vnp_ReturnUrl: returnUrl,
      vnp_TxnRef: orderId,
    };

    const sortedParams = sortObject(vnp_Params);
    const signData = querystring.stringify(sortedParams);
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const vnp_SecureHash = hmac.update(signData).digest("hex");
    vnp_Params["vnp_SecureHash"] = vnp_SecureHash;

    const paymentUrl = `${vnp_Url}?${querystring.stringify(vnp_Params)}`;
    return {
      partnerCode: vnp_TmnCode,
      orderId,
      amount,
      responseTime: Date.now(),
      message: "Thành công",
      resultCode: 0, // Giả lập resultCode như MoMo
      paymentUrl,
    };
  } catch (error) {
    throw new Error(`Failed to create VNPay payment: ${error.message}`);
  }
};

// exports.verifyVNPayCallback = (callbackData) => {
//     try {
//         const vnp_HashSecret = process.env.VNPAY_SECRET_KEY;
//         const vnp_SecureHash = callbackData.vnp_SecureHash;
//         delete callbackData.vnp_SecureHash;
//
//         const sortedParams = sortObject(callbackData);
//         const signData = querystring.stringify(sortedParams);
//         const hmac = crypto.createHmac('sha512', vnp_HashSecret);
//         const calculatedHash = hmac.update(signData).digest('hex');
//
//         const isValidSignature = calculatedHash === vnp_SecureHash;
//         const isSuccess = callbackData.vnp_ResponseCode === '00' && callbackData.vnp_TransactionStatus === '00';
//
//         return {
//             isValidSignature,
//             isSuccess,
//             responseCode: callbackData.vnp_ResponseCode,
//             transactionStatus: callbackData.vnp_TransactionStatus
//         };
//     } catch (error) {
//         throw new Error(`Failed to verify VNPay callback: ${error.message}`);
//     }
// };

exports.verifyVNPayCallback = (callbackData) => {
  try {
    // Kiểm tra các trường bắt buộc
    const requiredFields = [
      "vnp_TxnRef",
      "vnp_Amount",
      "vnp_ResponseCode",
      "vnp_TransactionStatus",
      "vnp_SecureHash",
    ];
    for (const field of requiredFields) {
      if (!callbackData[field]) {
        throw new AppError(`Thiếu trường ${field} trong callback VNPay`, 400);
      }
    }

    const vnp_HashSecret = process.env.VNPAY_SECRET_KEY;
    const vnp_SecureHash = callbackData.vnp_SecureHash;
    delete callbackData.vnp_SecureHash;

    const sortedParams = sortObject(callbackData);
    const signData = querystring.stringify(sortedParams);

    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const calculatedHash = hmac.update(signData).digest("hex");

    const isValidSignature = calculatedHash === vnp_SecureHash;
    const isSuccess =
      callbackData.vnp_ResponseCode === "00" &&
      callbackData.vnp_TransactionStatus === "00";

    return {
      isValidSignature,
      isSuccess,
      responseCode: callbackData.vnp_ResponseCode,
      transactionStatus: callbackData.vnp_TransactionStatus,
      transactionId: callbackData.vnp_TransactionNo,
    };
  } catch (error) {
    console.error("Lỗi xác minh callback VNPay:", error);
    throw new AppError(
      `Không thể xác minh callback VNPay: ${error.message}`,
      400
    );
  }
};
