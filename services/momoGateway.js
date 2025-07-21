const axios = require('axios');
const crypto = require('crypto');

exports.createMomoPayment = async (paymentData) => {
    const { orderId, amount = 50000, orderInfo = 'Thanh Toán Với MoMo', extraData = '' } = paymentData;

    let ipnUrl = process.env.MOMO_IPN_URL;

    if(process.env.NODE_ENV === 'production') {
        ipnUrl = `${process.env.CLIENT_HOST}/api/v1/payments/callback/momo`;
    }

    const requestId = orderId;
    const requestType = 'captureWallet';
    const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${process.env.MOMO_PARTNER_CODE}&redirectUrl=${process.env.REDIRECT_URL}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto.createHmac('sha256', process.env.MOMO_SECRET_KEY)
        .update(rawSignature)
        .digest('hex');


    const requestBody = JSON.stringify({
        partnerCode: process.env.MOMO_PARTNER_CODE,
        accessKey: process.env.MOMO_ACCESS_KEY,
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl: process.env.REDIRECT_URL,
        ipnUrl: ipnUrl,
        lang: 'vi',
        extraData,
        requestType: requestType,
        signature
    });

    const options = {
        method: 'POST',
        url: `${process.env.MOMO_API_ENDPOINT}/create`,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
        },
        data: requestBody
    }

    const response = await axios(options);
    return response.data;
};

exports.verifyMomoCallback = (callbackData) => {
    console.log("CallBack từ Momo");
    const { signature, ...data } = callbackData;

    data.accessKey = process.env.MOMO_ACCESS_KEY;

    const rawSignature = Object.keys(data)
        .sort()
        .map(key => `${key}=${data[key]}`)
        .join('&');

    const expectedSignature = crypto.createHmac('sha256', process.env.MOMO_SECRET_KEY)
        .update(rawSignature)
        .digest('hex');

    return {
        isValid: expectedSignature === signature,
        data
    };
};

