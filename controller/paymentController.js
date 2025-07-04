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
//
const Ticket = require("../model/ticketModel");
const Food = require("../model/foodModel");
const Cinema = require("../model/cinemaModel");
const Showtime = require("../model/showtimeModel");
const Seat = require("../model/seatModel");
const TicketSeat = require("../model/ticketSeatModel");
const TicketFood = require("../model/ticketFoodModel");
const Booking = require("../model/bookingModel");
const User = require("../model/userModel");
const PaymentMethod = require("../model/paymentMethodModel");
const Factory = require("./handleFactory");
const Email = require("../utils/email");

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

    const ticketSeats = await TicketSeat.find({
      ticketId: orderId,
    })
    const ticketFoods = await TicketFood.find({
        ticketId: orderId,
    });

    const seatIds = ticketSeats.map((item) => item.seatId);

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
        })
      await sendBookingConfirmationEmail(ticket, seatIds, ticketFoods);
    }
    else {
      await Booking.deleteMany({
        seatId: { $in: seatIds },
        userId: ticket.userId,
        showtimeId: ticket.showtimeId,
      });
    }

}

const sendBookingConfirmationEmail = async (ticket, seatIds, ticketFoods) => {
    const user = ticket.userId;
    const userInfo = await User.findById(user).select('name email');
    const showtime = ticket.showtimeId;
    const info = await Showtime.aggregate([{
        $match: { _id: showtime }
    }, {
        $lookup: {
            from: 'movies',
            localField: 'movieId',
            foreignField: '_id',
            as: 'movie'
        }
    }, {
        $unwind: '$movie'
    },
    {
        $lookup: {
            from: 'rooms',
            localField: 'roomId',
            foreignField: '_id',
            as: 'room'
        }
    }, {
        $unwind: '$room'
    }]);

    const cinema = await Cinema.findById(info[0].room.cinemaId);


    const seatDetails = await Promise.all(
        seatIds.map(async (seatId) => {
            const seat = await Seat.findById(seatId);
            return seat;
        })
    );

    const foodDetails = await Promise.all(
        ticketFoods.map(async (tf) => {
            const food = await Food.findById(tf.foodId);
            return {
                name: food.name,
                quantity: tf.quantity,
                price: tf.priceAtPurchase,
                total: tf.quantity * tf.priceAtPurchase
            };
        })
    );
    const movie = info[0].movie;
    const room = info[0].room;

    console.log(info[0].userId);

    const emailContent = {
        bookingCode: ticket.ticketCode,
        movieTitle: movie.name,
        cinemaName: cinema.name,
        cinemaAddress: cinema.address,
        roomNumber: room.roomName,
        startTime: info[0].startTime,
        endTime: info[0].endTime,
        seatNumbers: seatDetails.map(seat => `${seat.seatRow}${seat.seatNumber}`).join(', '),
        ticketQuantity: seatIds.length,
        totalAmount: ticket.totalAmount.toLocaleString('vi-VN') + ' VNĐ',
        moviePoster: movie.posterUrl,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.ticketCode}`,
        openingHours: '8:00 - 23:00',
        downloadTicketUrl: `${process.env.FE_ADMIN_CLIENT_HOST}/tickets/${ticket.ticketCode}/download`,
        manageBookingUrl: `${process.env.FE_ADMIN_CLIENT_HOST}/my-bookings`,
        viewMovieInfoUrl: `${process.env.FE_ADMIN_CLIENT_HOST}/chitietsanpham/${movie.slug}`,
        foods: foodDetails,
        totalFoodAmount: foodDetails.reduce((sum, food) => sum + food.total, 0).toLocaleString('vi-VN') + ' VNĐ',
        ticketAmount: (ticket.totalAmount - foodDetails.reduce((sum, food) => sum + food.total, 0)).toLocaleString('vi-VN') + ' VNĐ'
    };

    await new Email(userInfo, emailContent).sendBookingConfirmation();
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
