const catchAsync = require("../utils/catchAsync");
const {
  createPaymentByGateway,
  verifyCallbackByGateway,
} = require("../services/paymentService");
const { v4: uuidv4 } = require("uuid");
const AppError = require("../utils/appError");
const crypto = require("crypto");
const CryptoJS = require('crypto-js');
const qs = require('qs');
const axios = require("axios");

const Ticket = require("../model/ticketModel");
const TicketSeat = require("../model/ticketSeatModel");
const Booking = require("../model/bookingModel");
const User = require("../model/userModel");
const PaymentMethod = require("../model/paymentMethodModel");
const Factory = require("./handleFactory");

const validatePaymentData = (data, next) => {
  const required = ["orderId", "amount", "gateway"];
  for (const field of required) {
    if (!data[field]) {
      next(new AppError(`Thiếu field ${field}`, 400));
    }
  }

  if (data.amount <= 0) {
    next(new AppError("Số tiền phải lớn hơn 0", 400));
  }

  if (!["Momo", "VnPay", "Zalopay"].includes(data.gateway)) {
    next(new AppError("Không có phương thức này", 400));
  }
};

const updateTicketStatus = async (orderId, status) => {
    const ticket = await Ticket.findByIdAndUpdate({
      _id: orderId,
    }, {
      paymentStatus: status,
      bookingStatus: "Confirmed",
    }, {
      new: true,
      runValidators: true,
    })

    if(!ticket) {
      throw new Error("Không tìm thấy vé với orderId: " + orderId)
    }

    const tiketSeats = await TicketSeat.find({
      ticketId: orderId,
    })
    const seatIds = tiketSeats.map((item) => item.seatId);

    if( status === "Paid" ) {
      await Booking.updateMany(
          {
            seatId: {$in: seatIds},
            userId: ticket.userId,
            showtimeId: ticket.showtimeId
          },
          {status: "success"}
      );
      // Tăng memberShipPoints
      await User.updateOne({
        _id: ticket.userId,
      }, {
            $inc: { memberShipPoints: ticket.totalAmount },
        }
      )
    }
    else {
      await Booking.deleteMany({
        seatId: { $in: seatIds },
        userId: ticket.userId,
        showtimeId: ticket.showtimeId,
      });
    }

}


exports.getPaymentGateways = Factory.getAll(PaymentMethod);

exports.createPayment = catchAsync(async (req, res, next) => {

  validatePaymentData(req.body, next);

  const { orderId, amount, gateway, orderInfo, ...additionalData } =
    req.body;

  const gatewayResponse = await createPaymentByGateway(gateway, {
    orderId,
    amount,
    orderInfo,
    ...additionalData,
  });

  res.status(200).json({
    status: "success",
    data: {
      payment: gatewayResponse,
    },
  });
});

exports.momoCallback = catchAsync(async (req, res, next) => {
  const valid = await verifyCallbackByGateway("momo", req.body);

  if (!valid.isValid) {
    return next(new AppError("Chữ ký không hợp lệ", 400));
  }
  const { orderId,  resultCode} = valid.data;

  if (resultCode !== 0) {
    // Cập nhật trạng thái thanh toán không thành công
    await updateTicketStatus(orderId, "Failed");
    return next(new AppError("Thanh toán không thành công", 400));
  }
    // Cập nhật trạng thái thanh toán thành công
  await updateTicketStatus(orderId, "Paid");

  res.status(200).json({
    status: "success",
  });
});

exports.vnpayCallback = catchAsync(async (req, res, next) => {
  const valid = await verifyCallbackByGateway("vnpay", req.query);
  if (!valid.isValid) {
    return next(new AppError("Chữ ký không hợp lệ", 400));
  }
  const data = valid.data;
  const orderId = data.vnp_TxnRef;
  if( data.vnp_ResponseCode === "00" ) {
    await updateTicketStatus(orderId, "Paid");
  }else {
    await updateTicketStatus(orderId, "Failed");
    return next(new AppError("Thanh toán không thành công", 400));
  }

  res.status(200).json({
    status: "success",
    message: "Bạn đã thanh toán thành công",
  });
});

exports.zalopayCallback = catchAsync(async (req, res, next) => {
    const valid = await verifyCallbackByGateway("zalopay", req.body);
    if (valid.return_code !== 1) {
      return next(new AppError("Chữ ký không hợp lệ", 400));
    }
    const { data } = valid;

    // Cập nhật trạng thái thanh toán thành công
    const embedData = JSON.parse(data.embed_data);
    const orderId = embedData.order_id;

    await updateTicketStatus(orderId, "Paid");

    res.status(200).json({
        status: "success",
        message: "Bạn đã thanh toán thành công",
    });
});

exports.queryMomoPayment = async (orderId) => {
  const requestId = orderId;
  const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&orderId=${orderId}&partnerCode=${process.env.MOMO_PARTNER_CODE}&requestId=${requestId}`;
  const signature = crypto
    .createHmac("sha256", process.env.MOMO_SECRET_KEY)
    .update(rawSignature)
    .digest("hex");

  const requestBody = {
    partnerCode: process.env.MOMO_PARTNER_CODE,
    requestId,
    orderId,
    signature,
    lang: "vi",
  };

  const options = {
    method: "POST",
    url: `${process.env.MOMO_API_ENDPOINT}/query`,
    headers: {
      "Content-Type": "application/json",
    },
    data: requestBody,
  };
  try {
    const response = await axios(options);

    if (response.data.resultCode === 0) {
      const { orderId } = response.data;
      await updateTicketStatus(orderId, "Paid");
    }else{
        // Cập nhật trạng thái thanh toán không thành công
        await updateTicketStatus(orderId, "Failed");
        return next(new AppError("Thanh toán không thành công", 400));
    }

    res.status(200).json({
      status: "success",
      data: {
        resultCode: response.data.resultCode,
        message: response.data.message,
      },
    });
  }catch (error) {
    return next(new AppError(`Lỗi khi truy vấn MoMo: ${error.message}`, 500));
  }

};

exports.queryZaloPayPayment = async (appTransId) => {
  let postData = {
    app_id: process.env.ZALOPAY_APP_ID,
    app_trans_id: appTransId, // Input your app_trans_id
  }

  let data = postData.app_id + "|" + postData.app_trans_id + "|" + process.env.ZALOPAY_APP_SECRET_KEY_1; // appid|app_trans_id|key1
  postData.mac = CryptoJS.HmacSHA256(data, process.env.ZALOPAY_APP_SECRET_KEY_1).toString();

  let postConfig = {
    method: 'post',
    url: process.env.ZALOPAY_RETURN_URL_QUERY,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: qs.stringify(postData)
  };

  try{
    const result = await axios(postConfig);

    if (result.data.return_code === 1) {
      const embedData = JSON.parse(result.data.embed_data);
      const orderId = embedData.order_id;

      await updateTicketStatus(orderId, "Paid");
    } else if (result.data.return_code === 2) {
      await updateTicketStatus(orderId, "Failed");
      return next(new AppError("Giao dịch thất bại", 400));
    }

    res.status(200).json({
        status: "success",
        data: {
            transactionStatus: result.data.return_code,
            message: result.data.return_message
        }
    })
  }
  catch (error) {
      return next(new AppError(`Lỗi khi truy vấn ZaloPay: ${error.message}`, 500));
  }
};
