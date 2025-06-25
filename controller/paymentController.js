const catchAsync = require('../utils/catchAsync');
const {createPaymentByGateway, verifyCallbackByGateway} = require('../services/paymentService');
const { v4: uuidv4 } = require('uuid');
const AppError = require("../utils/appError");
const crypto = require("crypto");
const axios = require("axios");

const validatePaymentData = (data, next) => {
    const required = ['userId', 'orderId', 'amount', 'gateway'];
    for (const field of required) {
        if (!data[field]) {
            next(new AppError(`Thiếu field ${field}`, 400));
        }
    }

    if (data.amount <= 0) {
        next(new AppError('Số tiền phải lớn hơn 0', 400));
    }

    if (!['momo', 'vnpay', 'zalopay'].includes(data.gateway)) {
        next(new AppError('Không có phương thức này', 400));
    }
};

exports.createPayment = catchAsync(async (req, res, next) => {

    // validatePaymentData(req.body, next);

    const { userId, orderId, amount, gateway, orderInfo, ...additionalData } = req.body;

    //Code hoặc ID của đơn hàng đó
    const paymentId = uuidv4();
    //

    //Lưu vào trong database

    //

    const gatewayResponse = await createPaymentByGateway(gateway, {
        orderId: paymentId,
        amount,
        orderInfo,
        ...additionalData
    });

    res.status(200).json({
        status: 'success',
        data: {
            payment: gatewayResponse
        }
    });
})

exports.momoCallback = catchAsync(async (req, res, next) => {
    const isValid = verifyCallbackByGateway('momo', req.body);
    if (!isValid) {
        return next(new AppError('Chữ ký không hợp lệ', 400));
    }
    // Xử lý callback từ MoMo
    // Cập nhật trạng thái thanh toán trong database
    // ...
    console.log("Callback từ MoMo");

    res.status(200).json({
        status: 'success',
    });
})

exports.vnpayCallback = catchAsync(async (req, res, next) => {
    const isValid = verifyCallbackByGateway('vnpay', req.query);
    if (!isValid) {
        return next(new AppError('Chữ ký không hợp lệ', 400));
    }

    res.status(200).json({
        status: 'success',
        message: 'Bạn đã thanh toán thành công'
    });
});

exports.queryMomoPayment = catchAsync(async (req, res, next) => {
    const { orderId } = req.body;
    const requestId = orderId;
    const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&orderId=${orderId}&partnerCode=${process.env.MOMO_PARTNER_CODE}&requestId=${requestId}`;
    const signature = crypto.createHmac('sha256', process.env.MOMO_SECRET_KEY)
        .update(rawSignature)
        .digest('hex');

    const requestBody = {
        partnerCode: process.env.MOMO_PARTNER_CODE,
        requestId,
        orderId,
        signature,
        lang: 'vi'
    };

    const options = {
        method: 'POST',
        url: `${process.env.MOMO_API_ENDPOINT}/query`,
        headers: {
            'Content-Type': 'application/json',
        },
        data: requestBody
    };

    const response = await axios(options);

    if (response.data.resultCode === 0) {
        //Cập nhập Database
    }

    res.status(200).json({
        status: 'success',
        data: {
            resultCode: response.data.resultCode,
            message: response.data.message,
        }
    })
});

exports.queryVNPayPayment = catchAsync(async (req, res, next) => {
    const { orderId } = req.body;
    const vnp_TmnCode = process.env.VNPAY_TMN_CODE;
    const vnp_HashSecret = process.env.VNPAY_SECRET_KEY;
    const vnp_Url = process.env.VNPAY_API_ENDPOINT || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction';

    const date = new Date();
    const vnp_CreateDate = date.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const vnp_RequestId = uuidv4();
    const vnp_IpAddr = '127.0.0.1';

    const vnp_Params = {
        vnp_Command: 'querydr',
        vnp_TmnCode,
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Truy van giao dich ${orderId}`,
        vnp_CreateDate,
        vnp_RequestId,
        vnp_IpAddr,
        vnp_Version: '2.1.0'
    };

    const sortedParams = Object.keys(vnp_Params).sort().reduce((obj, key) => {
        obj[key] = vnp_Params[key];
        return obj;
    }, {});

    const signData = querystring.stringify(sortedParams);
    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const vnp_SecureHash = hmac.update(signData).digest('hex');
    vnp_Params['vnp_SecureHash'] = vnp_SecureHash;

    const options = {
        method: 'POST',
        url: vnp_Url,
        headers: {
            'Content-Type': 'application/json',
        },
        data: vnp_Params
    };

    const response = await axios(options);

    if (response.data.vnp_TransactionStatus === '00') {
        // TODO: Cập nhật database (giao dịch thành công)
    }

    res.status(200).json({
        status: 'success',
        data: {
            transactionStatus: response.data.vnp_TransactionStatus,
            message: response.data.vnp_Message
        }
    });
});