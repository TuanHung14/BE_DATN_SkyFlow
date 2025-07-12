const crypto = require("crypto");
const querystring = require("querystring");

const { VNPay, ignoreLogger, ProductCode, dateFormat, VnpLocale} = require("vnpay");
const Ticket = require("../model/ticketModel");

const sortObject = (obj) => {
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});
};

exports.createVNPayPayment = async (paymentData) => {
  try {
    const {
      orderId,
      amount,
      orderInfo = `Thanh-toan-don-hang-${orderId}`,
    } = paymentData;

    const vnpay = new VNPay(
        {
            tmnCode: process.env.VNPAY_TMN_CODE,
            secureSecret: process.env.VNPAY_SECRET_KEY,
            apiEndpoint: process.env.VNPAY_API_ENDPOINT,
            testMode: true,
            hashAlgorithm: "SHA512",
            loggerFn: ignoreLogger,
        }
    );

    const now = new Date();
    const expireDate = new Date();
    expireDate.setDate(now.getDate() + 1);

    const vnp_CreateDate = dateFormat(now);
    const vnp_ExpireDate = dateFormat(expireDate);

    const paymentUrl = await vnpay.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: '192.168.1.1',
      vnp_ReturnUrl: process.env.REDIRECT_URL,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: ProductCode.Other,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate,
      vnp_ExpireDate,
    });
    const ticketDetails = await Ticket.findById(orderId);

    if(ticketDetails){
      ticketDetails.transDate = vnp_CreateDate;

      await ticketDetails.save();
    }

    return { paymentUrl };

  } catch (error) {
    throw new Error(`Failed to create VNPay payment: ${error.message}`);
  }
};

exports.verifyVNPayCallback = (callbackData) => {
  try {
    const secureHash = callbackData.vnp_SecureHash;
    const hashType = callbackData.vnp_SecureHashType || 'SHA512';

    // Clone và loại bỏ các trường hash khỏi dữ liệu gốc
    const data = { ...callbackData };
    delete data.vnp_SecureHash;
    delete data.vnp_SecureHashType;

    // Sắp xếp các key theo thứ tự tăng dần
    const sortedData = sortObject(data);

    // Convert object thành chuỗi query string
    const signData = querystring.stringify(sortedData, '&', '=', {
      encodeURIComponent: querystring.unescape, // giữ nguyên giá trị
    });

    // Tạo chữ ký hash để so sánh
    const hmac = crypto.createHmac(hashType, process.env.VNPAY_SECRET_KEY);
    const signed = hmac.update(signData).digest('hex');

    // So sánh chữ ký tạo ra với chữ ký gửi từ VNPay
    const isValid = secureHash === signed;

    return {
      isValid,
      data: sortedData,
    };
  } catch (error) {
    throw new Error(`Failed to verify VNPay callback: ${error.message}`);
  }
};
