const axios = require('axios').default;
const CryptoJS = require('crypto-js');
const moment = require('moment');
const Ticket = require('../model/ticketModel');

exports.createZaloPayPayment = async (paymentData) => {
    const { orderId, amount = 10000, orderInfo = 'Thanh Toán Với ZaloPay'} = paymentData;

    const embed_data = {
        redirecturl: process.env.REDIRECT_URL,
        order_id: orderId
    };

    // Lấy thông tin đơn hàng từ orderId
    // orderId
    const ticketDetails = await Ticket.findById(orderId)
        .populate({
            path: 'showtimeId',
            populate: [
                {
                    path: 'movieId',
                    select: 'name posterUrl'
                }
            ]
        });
    const movieName = ticketDetails?.showtimeId?.movieId?.name || 'Tên phim';

    const description = `Phim: ${movieName}`;

    const items = [{}];

    let ipnUrl = process.env.ZALOPAY_IPN_URL;
    if(process.env.NODE_ENV === 'production') {
        ipnUrl = `${process.env.CLIENT_HOST}/api/v1/payments/callback/zalopay`;
    }

    console.log(ipnUrl);

    const appTransId = `${moment().format('YYMMDD')}_${orderId}`;

    const order = {
        app_id: process.env.ZALOPAY_APP_ID,
        app_trans_id: appTransId,
        app_user: "user123",
        app_time: Date.now(), // miliseconds
        item: JSON.stringify(items),
        embed_data: JSON.stringify(embed_data),
        amount: amount,
        description: description,
        bank_code: "zalopayapp",
        callback_url: ipnUrl
    };

    const data = process.env.ZALOPAY_APP_ID + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
    order.mac = CryptoJS.HmacSHA256(data, process.env.ZALOPAY_APP_SECRET_KEY_1).toString();

    try{
        const result = await axios.post(process.env.ZALOPAY_API_ENDPOINT, null, { params: order });
        if (ticketDetails) {
            ticketDetails.appTransId = appTransId;
            await ticketDetails.save();
        }
        return {
            ... result.data,
            appTransId: appTransId
        };
    }catch (error){
        throw new Error(`Failed to create ZaloPay payment: ${error.message}`);
    }

}

exports.verifyZaloPayCallback = async (callbackData) => {
    let result = {};
    const { data, mac } = callbackData;

    try {
        let dataStr = data;
        let reqMac = mac;

        let calculatedMac = CryptoJS.HmacSHA256(dataStr, process.env.ZALOPAY_APP_SECRET_KEY_2).toString();

        // kiểm tra callback hợp lệ (đến từ ZaloPay server)
        if (reqMac !== calculatedMac) {
            // callback không hợp lệ
            result.return_code = -1;
            result.return_message = "mac not equal";
        }
        else {
            // thanh toán thành công
            // merchant cập nhật trạng thái cho đơn hàng
            let dataJson = JSON.parse(dataStr, process.env.ZALOPAY_APP_SECRET_KEY_2);
            result.data = JSON.parse(data);
            result.return_code = 1;
            result.return_message = "success";
        }
    } catch (ex) {
        result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
        result.return_message = ex.message;
    }

    // thông báo kết quả cho ZaloPay server
    return result;
}