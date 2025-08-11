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
const moment = require('moment');
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
const VoucherUse = require("../model/voucherUseModel");
const Voucher = require("../model/voucherModel");
const Level = require("../model/levelModel");
const Factory = require("./handleFactory");
const Email = require("../utils/email");
const mongoose = require("mongoose");

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
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Toàn bộ logic update đặt trong session
        const ticket = await Ticket.findByIdAndUpdate(
            { _id: orderId },
            {
                paymentStatus: status,
                bookingStatus: "Confirmed",
            },
            {
                new: true,
                runValidators: true,
                session,
            }
        );

        if (!ticket) {
            throw new Error("Không tìm thấy vé với orderId: " + orderId);
        }

        const ticketSeats = await TicketSeat.find({ ticketId: orderId }, null, { session });
        const ticketFoods = await TicketFood.find({ ticketId: orderId }, null, { session });

        const seatIds = ticketSeats.map((item) => item.seatId);

        if (status === "Paid") {
            await Booking.updateMany(
                {
                    seatId: { $in: seatIds },
                    userId: ticket.userId,
                    showtimeId: ticket.showtimeId,
                },
                { status: "success" },
                { session }
            );

            const user = await User.findById(ticket.userId, null, { session }).populate('level').select('+name +email +spinCount +totalEarnedPoints +memberShipPoints +level');

            // Cập nhật người dùng
            if (user) {
                const earnedPoints = Math.floor(ticket.totalAmount * user.level.pointMultiplier);
                user.totalEarnedPoints += earnedPoints;
                user.memberShipPoints += earnedPoints;
                user.spinCount += 1;
                // Check xem người dùng có đủ điểm để nâng cấp cấp độ không
                const level = await Level.find(
                    {
                        active: true,
                    },
                    null,
                    { session }
                ).sort({ pointMultiplier: -1 });

                // Lấy level cao hơn level hiện tại của người dùng
                const nextLevel = level.find(l => l.minXp <= user.totalEarnedPoints);

                if (nextLevel && user.level._id.toString() !== nextLevel._id.toString()) {
                    const currentLevel = user.level.name;
                    user.level = nextLevel._id;

                    if (nextLevel.voucherId) {
                        await VoucherUse.findOneAndUpdate(
                            { userId: user._id, voucherId: nextLevel.voucherId },
                            { $inc: { usageLimit: 1 } },
                            { new: true, upsert: true }
                        ).session(session);
                    }

                    const voucher = nextLevel.voucherId ? await Voucher.findById(nextLevel.voucherId).session(session) : null;

                    const emailContent = {
                        userName: user.name,
                        currentLevel: currentLevel,
                        nextLevel: nextLevel.name,
                        icon: nextLevel.icon,
                        voucherCode: voucher ? voucher.voucherCode : 'Không có voucher',
                        voucherName: voucher ? voucher.voucherName : 'Không có voucher',
                        discountValue: voucher ? voucher.discountValue : 'Không có voucher',
                        imageUrl: voucher ? voucher.imageUrl : '',
                    };

                    // Gửi email thông báo nâng cấp cấp độ
                    await new Email(user, emailContent).sendNextLevel()
                }
                await user.save({ session });
            }

            const realTicket = await Ticket.findById(ticket._id).session(session);
            realTicket.qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.ticketCode}`;
            await realTicket.save({ session });

            await session.commitTransaction();
            session.endSession();

            // Gửi email sau khi commit transaction
            await sendBookingConfirmationEmail(realTicket, seatIds, ticketFoods);
        } else if (status === "Failed") {
            await Booking.deleteMany(
                {
                    seatId: { $in: seatIds },
                    userId: ticket.userId,
                    showtimeId: ticket.showtimeId,
                },
                { session }
            );

            if (ticket.voucherUseId) {
                await VoucherUse.updateOne(
                    {
                        _id: ticket.voucherUseId,
                        usageCount: { $gt: 0 },
                    },
                    {
                        $inc: { usageCount: -1 },
                    },
                    { session }
                );
            }

            for (const tf of ticketFoods) {
                await Food.updateOne(
                    { _id: tf.foodId },
                    { $inc: { inventoryCount: tf.quantity } },
                    { session }
                );
            }

            await session.commitTransaction();
            session.endSession();
        }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

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
        qrCode: ticket.qrUrl,
        openingHours: '8:00 - 23:00',
        manageBookingUrl: `${process.env.FE_CLIENT_HOST}/taikhoan/lich-su-giao-dich`,
        viewMovieInfoUrl: `${process.env.FE_CLIENT_HOST}/chitietsanpham/${movie.slug}`,
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
  console.log("CallBack từ momo");
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
    const data  = response.data;

    if (data.resultCode === 0 || data.resultCode === 9000) {
      await updateTicketStatus(orderId, "Paid");
    }
    else if([7000, 7002, 1000].includes(data.resultCode)){
        console.log(`[MoMo] Giao dịch ${orderId} đang pending (${data.resultCode})`);
    }
    else{
        // Cập nhật trạng thái thanh toán không thành công
        await updateTicketStatus(orderId, "Failed");
    }
  }catch (error) {
      console.error(`[Momo] 🔥 Lỗi truy vấn thanh toán: ${error.message}`);
  }

};

exports.queryZaloPayPayment = async (appTransId, orderId) => {
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
      await updateTicketStatus(orderId, "Paid");
    } else if (result.data.return_code === 2) {
      await updateTicketStatus(orderId, "Failed");
    }
  }
  catch (error) {
      console.error(`[ZaloPay] 🔥 Lỗi truy vấn thanh toán: ${error.message}`);
  }
};

exports.queryVnPayPayment = async (orderId, transDate) => {
    const vnp_Version = "2.1.0";
    const vnp_Command = "querydr";
    const vnp_RequestId = `${Date.now()}${Math.floor(Math.random() * 1000000)}`;
    const vnp_CreateDate = moment().format('YYYYMMDDHHmmss');
    const vnp_IpAddr = "127.0.0.1";
    const vnp_TmnCode = process.env.VNPAY_TMN_CODE;
    const vnp_TxnRef = orderId.toString();
    const vnp_TransactionDate = transDate;
    const vnp_OrderInfo = 'Truy van GD ma:' + vnp_TxnRef;

    const data = [
        vnp_RequestId,
        vnp_Version,
        vnp_Command,
        vnp_TmnCode,
        vnp_TxnRef,
        vnp_TransactionDate,
        vnp_CreateDate,
        vnp_IpAddr,
        vnp_OrderInfo
    ].join('|');

    const hmac = crypto.createHmac('sha512', process.env.VNPAY_SECRET_KEY);
    const vnp_SecureHash = hmac.update(Buffer.from(data, 'utf-8')).digest('hex');
    try {
        const dataObj = {
            vnp_RequestId,
            vnp_Version,
            vnp_Command,
            vnp_TmnCode,
            vnp_TxnRef,
            vnp_OrderInfo,
            vnp_TransactionDate,
            vnp_CreateDate,
            vnp_IpAddr,
            vnp_SecureHash
        };

        const response = await axios.post(process.env.VNPAY_API_URL, dataObj, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10s timeout
        });

        const result = response.data;

        // if (result.vnp_ResponseCode === "00" && result.vnp_TransactionStatus === "00") {
        //     await updateTicketStatus(orderId, "Paid");
        // } else if (result.vnp_ResponseCode === "00" && result.vnp_TransactionStatus !== "00") {
        //     await updateTicketStatus(orderId, "Failed");
        // }

        if (result.vnp_ResponseCode === "00") {
            if (result.vnp_TransactionStatus === "00") {
                await updateTicketStatus(orderId, "Paid");
            } else if (["01"].includes(result.vnp_TransactionStatus)) {
                console.log(`[VNPAY] Giao dịch ${orderId} đang xử lý (${result.vnp_TransactionStatus})`);
            } else {
                await updateTicketStatus(orderId, "Failed");
            }
        } else {
            await updateTicketStatus(orderId, "Failed");
        }
    } catch (error) {
        console.error(`[VnPay] 🔥 Lỗi truy vấn thanh toán: ${error.message}`);
        return null;
    }
}
