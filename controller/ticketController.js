const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Ticket = require('../model/ticketModel');
const Seat = require('../model/seatModel');
const Food = require('../model/foodModel');
const Showtime = require('../model/showtimeModel');
const PriceRule = require('../model/priceRuleModel');
const VoucherUse = require('../model/voucherUseModel');
const TicketFood = require('../model/ticketFoodModel');
const TicketSeat = require('../model/ticketSeatModel');
const Booking = require("../model/bookingModel");
const APIFeatures = require('../utils/apiFeatures');
const APIAggregate = require("../utils/apiAggregate");

exports.createTicket = catchAsync(async (req, res, next) => {
    const { showtimeId, seatsId, foodsId, paymentMethodId, voucherUseId } = req.body;

    const userId = req.user.id;

    if (!showtimeId || !seatsId?.length || !paymentMethodId) {
        throw new AppError(`Vui lòng cung cấp suất chiếu, ghế và phương thức thanh toán`, 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    let isTransactionCommitted = false;

    try {
        // Kiểm tra suất chiếu
        const showtime = await Showtime.findOne({ _id: showtimeId, status: 'scheduled', isDeleted: false })
            .populate('formatId roomId')
            .session(session);

        if (!showtime) {
            return next(new AppError('Suất chiếu không tồn tại hoặc không khả dụng', 400));
        }

        // Kiểm tra ghế trong database
        const seats = await Seat.find({
            _id: { $in: seatsId },
            roomId: showtime.roomId._id,
            status: 'active',
            hidden: false
        }).session(session);

        const bookingSeats = await Booking.find({
            seatId: { $in: seatsId },
            showtimeId,
            status: { $in: ['pending', 'confirmed'] },
            userId
        })

        if (bookingSeats.length > 0) {
            return next(new AppError('Một số ghế đã được đặt hoặc đang chờ xác nhận', 400));
        }

        if (seats.length !== seatsId.length) {
            return next(new AppError('Một số ghế không tồn tại', 400));
        }

        // Kiểm tra đồ ăn
        const foodPrices = foodsId?.length ? await Promise.all(foodsId.map(async ({ foodId, quantity }) => {
            const food = await Food.findOne({_id: foodId, status: 'active'}).session(session);
            if (food.inventoryCount < quantity) {
                return next(new AppError(`Thức ăn ${food?.name || 'này'} không đủ số lượng hoặc không khả dụng`, 400));
            }
            return { foodId, quantity, price: food.price * quantity, priceAtPurchase: food.price };
        })) : [];

        // Tính giá ghế
        const seatPrices = await Promise.all(seatsId.map(async (seatId) => {
            const seat = seats.find(s => s._id.equals(seatId));
            const priceRule = await PriceRule.findOne({
                seatType: seat.seatType,
                formats: showtime.formatId
            }).session(session);
            if (!priceRule) {
                return next(new AppError(`Không tìm thấy quy tắc giá cho loại ghế ${seat.seatType} và định dạng ${showtime.formatId.name}`, 400));
            }
            return { seatId, price: priceRule.price };
        }));

        // Tính tổng giá
        let totalAmount = seatPrices.reduce((sum, item) => sum + item.price, 0) +
            foodPrices.reduce((sum, item) => sum + item.price, 0, 0);

        // Áp dụng voucher
        let discount = 0;
        if (voucherUseId) {
            const voucher = await VoucherUse.findOne({
                _id: voucherUseId,
                userId
            }).populate('voucherId', 'discountValue isActive').session(session);
            // Kiểm tra voucher có tồn tại và thuộc về người dùng
            if (!voucher) {
                return next(new AppError('Voucher không hợp lệ hoặc không thuộc về bạn', 400));
            }
            // Kiểm tra voucher có còn hiệu lực không
            if (!voucher.voucherId || !voucher.voucherId.isActive) {
                return next(new AppError('Voucher không còn hiệu lực', 400));
            }
            // Kiểm tra số lần sử dụng của voucher
            if (voucher.usageCount >= voucher.usageLimit) {
                return next(new AppError('Voucher đã hết lượt sử dụng', 400));
            }
            // Cập nhật số lần sử dụng của voucher
            await VoucherUse.findByIdAndUpdate(voucher._id, { $inc: { usageCount: 1 } }, { session });
            // Tính toán giảm giá
            discount = voucher.voucherId.discountValue;
            totalAmount = Math.max(0, totalAmount - discount);
        }

        const ticketCode = `TICKET_${Math.floor(100000 + Math.random() * 900000)}`;
        // Tạo vé
        const ticket = await Ticket.create([{
            ticketCode,
            bookingDate: new Date(),
            totalAmount,
            paymentStatus: 'Pending',
            bookingStatus: 'Confirmed',
            showtimeId,
            paymentMethodId,
            voucherUseId,
            userId
        }], { session });

        // Lưu vào ticket_seats
        if (seatPrices.length) {
            await Promise.all(seatPrices.map(item =>
                TicketSeat.create([{
                    ticketId: ticket[0]._id,
                    seatId: item.seatId,
                    priceAtBooking: item.price
                }], { session })
            ));
        }

        // Lưu vào ticket_foods
        if (foodPrices.length) {
            await Promise.all(foodPrices.map(item =>
                TicketFood.create([{
                    ticketId: ticket[0]._id,
                    foodId: item.foodId,
                    quantity: item.quantity,
                    priceAtPurchase: item.priceAtPurchase
                }], { session })
            ));
        }

        // Cập nhật trạng thái ghế trong database
        await Promise.all(
            seatsId.map(seatId =>
                Booking.updateOne(
                    {
                        seatId,
                        showtimeId,
                        userId,
                    },
                    {
                        $set: { status: 'pending' }
                    },
                    {
                        session,
                        upsert: true // nếu chưa có thì tạo mới
                    }
                )
            )
        );

        // Cập nhật inventory đồ ăn
        if (foodPrices.length) {
            await Promise.all(foodPrices.map(item =>
                Food.findByIdAndUpdate(item.foodId, {
                    $inc: { inventoryCount: -item.quantity }
                }, { session })
            ));
        }

        await session.commitTransaction();
        isTransactionCommitted = true;

        res.status(201).json({
            status: 'success',
            data: {
                ticketId: ticket[0]._id,
                ticketCode: ticket[0].ticketCode,
                bookingDate: ticket[0].bookingDate,
                totalAmount: ticket[0].totalAmount,
                paymentStatus: ticket[0].paymentStatus,
                bookingStatus: ticket[0].bookingStatus
            }
        });
    } catch (error) {
        if (!isTransactionCommitted) {
            await session.abortTransaction();
        }
        next(error);
    } finally {
        session.endSession();
    }
});

exports.getMyTickets = catchAsync(async (req, res, next) => {
    const filter = { userId: new mongoose.Types.ObjectId(req.user.id), paymentStatus: { $ne: "Failed" } };
    const pipeline = [];
    const limit = req.query.limit * 1 || 10;
    const page = req.query.page * 1 || 1;

    pipeline.push({ $match: filter });
    // join ticket seat
    pipeline.push(
        {
            $lookup: {
                from: 'ticketseats',
                localField: '_id',
                foreignField: 'ticketId',
                as: 'ticketSeats'
            }
        }
    );
    // Join ticket food
    pipeline.push(
        {
            $lookup: {
                from: 'ticketfoods',
                localField: '_id',
                foreignField: 'ticketId',
                pipeline: [
                    {
                        $project: {
                            quantity: 1,
                            foodId: 1,
                            priceAtPurchase: 1
                        }
                    }
                ],
                as: 'ticketFoods'
            }
        },
        { $unwind: "$ticketFoods" },
    );

    // Join Showtime
    pipeline.push(
        {
            $lookup: {
                from: 'showtimes',
                localField: 'showtimeId',
                foreignField: '_id',
                as: 'showtimeId'
            }
        },
        {
            $unwind: {
                path: '$showtimeId',
                preserveNullAndEmptyArrays: true
            }
        },
    )

    // Join movies
    pipeline.push(
        {
            $lookup: {
                from: "movies",
                localField: "showtimeId.movieId",
                foreignField: "_id",
                as: "showtimeId.movieId"
            }
        },
        {
            $unwind: {
                path: "$showtimeId.movieId",
                preserveNullAndEmptyArrays: true
            }
        },
    );

    // Join formats
    pipeline.push(
        {
            $lookup: {
                from: 'formats',
                localField: 'showtimeId.formatId',
                foreignField: '_id',
                pipeline: [
                    {
                        $project: {
                            name: 1,
                            _id: 0
                        }
                    }
                ],
                as: 'showtimeId.formatId'
            }
        },
        {
            $unwind: {
                path: '$showtimeId.formatId',
                preserveNullAndEmptyArrays: true
            }
        },
    );

    // Join paymentmethods
    pipeline.push(
        {
            $lookup: {
                from: 'paymentmethods',
                localField: 'paymentMethodId',
                foreignField: '_id',
                pipeline: [
                    {
                        $project: {
                            type: 1,
                            _id: 0
                        }
                    }
                ],
                as: 'paymentMethodId'
            }
        },
        {
            $unwind: {
                path: "$paymentMethodId",
                preserveNullAndEmptyArrays: true
            }
        },
    );

    // Join seat
    pipeline.push(
        {
            $lookup: {
                from: 'seats',
                localField: 'ticketSeats.seatId',
                foreignField: '_id',
                as: 'ticketSeats.seat'
            }
        },
    )

    // Join food và gán dô ticketFoods
    pipeline.push(
        {
            $lookup: {
                from: "foods",
                localField: "ticketFoods.foodId",
                foreignField: "_id",
                as: "foodInfo"
            }
        },
        { $unwind: "$foodInfo" },
        {
            $addFields: {
                "ticketFoods.foodInfo": "$foodInfo"
            }
        },
    );


    // Join movieratings để biết mình đánh giá hay chưa
    pipeline.push(
        {
            $lookup: {
                from: 'movieratings',
                let: { ticketId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$ticketId', '$$ticketId'] }
                        }
                    },
                    {
                        $limit: 1
                    }
                ],
                as: 'ratingInfo'
            }
        },
        {
            $addFields: {
                isRated: {
                    $cond: {
                        if: { $gt: [{ $size: '$ratingInfo' }, 0] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                ratingInfo: 0
            }
        },
    )

    //Group by vì mình unwind food
    pipeline.push(
        {
            $group: {
                _id: "$_id",
                ticketCode: { $first: "$ticketCode" },
                bookingDate: { $first: "$bookingDate" },
                appTransId: { $first: "$appTransId" },
                transDate: { $first: "$transDate" },
                totalAmount: { $first: "$totalAmount" },
                qrUrl: { $first: "$qrUrl" },
                paymentStatus: { $first: "$paymentStatus" },
                bookingStatus: { $first: "$bookingStatus" },
                showtimeId: { $first: "$showtimeId" },
                paymentMethodId: { $first: "$paymentMethodId" },
                userId: { $first: "$userId" },
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" },
                isRated: { $first: "$isRated" },
                ticketSeats: { $first: "$ticketSeats" },
                ticketFoods: { $push: "$ticketFoods" }
            }
        }
    );

    const tickets = await APIAggregate(Ticket, { limit, page }, pipeline);

    pipeline.push({
        $sort: { bookingDate: -1 }
    })

    res.status(200).json({
        status: 'success',
        data: tickets
    });
});

exports.getTicketById = catchAsync(async (req, res, next) => {
    const ticketId = req.params.id;

    const tickets = await Ticket.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(ticketId),
                userId: new mongoose.Types.ObjectId(req.user.id)
            }
        },
        {
            $lookup: {
                from: 'ticketseats',
                localField: '_id',
                foreignField: 'ticketId',
                as: 'ticketSeats'
            }
        },
        {
            $lookup: {
                from: 'ticketfoods',
                localField: '_id',
                foreignField: 'ticketId',
                as: 'ticketFoods'
            }
        },
        {
            $lookup: {
                from: 'showtimes',
                localField: 'showtimeId',
                foreignField: '_id',
                as: 'showtimeId'
            }
        },
        {
            $unwind: {
                path: '$showtimeId',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "movies",
                localField: "showtimeId.movieId",
                foreignField: "_id",
                as: "showtimeId.movieId"
            }
        },
        {
            $unwind: {
                path: "$showtimeId.movieId",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'formats',
                localField: 'showtimeId.formatId',
                foreignField: '_id',
                as: 'showtimeId.formatId'
            }
        },
        {
            $unwind: {
                path: '$showtimeId.formatId',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'rooms',
                localField: 'showtimeId.roomId',
                foreignField: '_id',
                as: 'showtimeId.roomId'
            }
        },
        {
            $unwind: {
                path: '$showtimeId.roomId',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'cinemas',
                localField: 'showtimeId.roomId.cinemaId',
                foreignField: '_id',
                as: 'showtimeId.roomId.cinema'
            }
        },
        {
            $unwind: {
                path: '$showtimeId.roomId.cinema',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'seats',
                localField: 'ticketSeats.seatId',
                foreignField: '_id',
                as: 'ticketSeats.seat'
            }
        },
        {
            $lookup: {
                from: 'foods',
                localField: 'ticketFoods.foodId',
                foreignField: '_id',
                as: 'ticketFoods.food'
            }
        },
        {
            $lookup: {
                from: 'movieratings',
                let: { ticketId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$ticketId', '$$ticketId'] }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            rating: 1
                        }
                    },
                    {
                        $limit: 1
                    }
                ],
                as: 'ratingInfo'
            }
        },
    ]);

    if (!tickets || tickets.length === 0) {
        return next(new AppError('Vé không tồn tại hoặc bạn không có quyền truy cập', 404));
    }

    res.status(200).json({
        status: 'success',
        data: tickets[0]
    });
});

exports.getAllTicketsAdmin = catchAsync(async (req, res, next) => {
    const filter = {
        'paymentStatus': { $ne: 'Failed' },
    };

    // Thêm bộ lọc cho ticket trong hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00 của ngày hôm nay
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Ngày mai

    filter.bookingDate = {
        $gte: today,
        $lt: tomorrow
    };

    if (req.query.search) {
        const searchTerm = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.ticketCode = { $regex: searchTerm, $options: 'i' };
    }

    const features = new APIFeatures(Ticket.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .pagination();

    const popOptions = [
        {
            path: 'showtimeId',
            select: 'showDate movieId roomId startTime',
            populate: [
                { path: 'movieId', select: 'name format age posterUrl duration' },
                { path: 'roomId', select: 'roomName', populate: { path: 'cinemaId' } }
            ],
        },
        { path: 'userId', select: 'name email phone' },
        { path: 'paymentMethodId', select: 'type status' },
        { path: 'voucherUseId', select: 'voucherId', populate: { path: 'voucherId', select: 'voucherName discountValue' } }
    ];

    const tickets = await features.query
        .select('ticketCode bookingDate totalAmount paymentStatus')
        .populate(popOptions)
        .lean();

    const countQuery = new APIFeatures(Ticket.find(filter), req.query)
        .filter()
    const totalTickets = await countQuery.query.clone().countDocuments();

    const ticketIds = tickets.map(ticket => ticket._id);
    const ticketSeats = await TicketSeat.find({ ticketId: { $in: ticketIds }})
        .select('ticketId seatId')
        .populate("seatId", "seatRow seatNumber")
        .lean();

    const ticketFoods = await TicketFood.find({ticketId: {$in: ticketIds }})
        .select('ticketId foodId quantity priceAtPurchase')
        .populate("foodId", "name")
        .lean();

    const ticketsWithSeats = tickets.map(ticket => {
        const seats = ticketSeats
            .filter(ts => ts.ticketId.toString() === ticket._id.toString() && ts.seatId)
            .map(ts => `${ts.seatId.seatRow}${ts.seatId.seatNumber}`);
        const foods = ticketFoods
            .filter(tf => tf.ticketId.toString() === ticket._id.toString() && tf.foodId)
            .map(tf => `${tf.foodId.name} x ${tf.quantity}`);
        return {
            ...ticket,
            seats,
            foods,
            seatCount: seats.length,
        };
    });

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const totalPages = Math.ceil(totalTickets / limit);

    res.status(200).json({
        status: 'success',
        totalDocs: totalTickets,
        totalPages,
        page,
        limit,
        data: {
            data: ticketsWithSeats,
        },
    });
});

exports.scanTicket = catchAsync(async (req, res, next) => {
    const { ticketCode } = req.params;

    const ticket = await Ticket.aggregate([
        {
            $match: { ticketCode: ticketCode, paymentStatus: "Paid" }
        },
        {
            $lookup: {
                from: 'ticketseats',
                localField: '_id',
                foreignField: 'ticketId',
                as: 'ticketSeats',
                pipeline: [
                    {
                        $project: { seatId: 1 },
                    },
                ],
            }
        },
        {
            $lookup: {
                from: 'ticketfoods',
                localField: '_id',
                foreignField: 'ticketId',
                as: 'ticketFoods',
                pipeline: [
                    {
                        $project: { foodId: 1 },
                    },
                ],
            }
        },
        {
            $lookup: {
                from: 'showtimes',
                localField: 'showtimeId',
                foreignField: '_id',
                as: 'showtimeId',
                pipeline: [
                    {
                        $project: { showDate: 1, startTime: 1, endTime: 1, movieId: 1, roomId: 1 },
                    },
                ],
            }
        },
        {
            $unwind: {
                path: '$showtimeId',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "movies",
                localField: "showtimeId.movieId",
                foreignField: "_id",
                as: "showtimeId.movieId"
            }
        },

        {
            $unwind: {
                path: "$showtimeId.movieId",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                movieName: '$showtimeId.movieId.name',
                movieFormat: "$showtimeId.movieId.format",
                movieDuration: "$showtimeId.movieId.duration",
            }
        },
        {
            $lookup: {
                from: 'rooms',
                localField: 'showtimeId.roomId',
                foreignField: '_id',
                as: 'showtimeId.roomId'
            }
        },
        {
            $unwind: {
                path: '$showtimeId.roomId',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                roomName: '$showtimeId.roomId.roomName'
            }
        },
        {
            $lookup: {
                from: 'cinemas',
                localField: 'showtimeId.roomId.cinemaId',
                foreignField: '_id',
                as: 'showtimeId.roomId.cinema'
            }
        },
        {
            $unwind: {
                path: '$showtimeId.roomId.cinema',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                cinemaName: '$showtimeId.roomId.cinema.name',
                cinemaAddress: '$showtimeId.roomId.cinema.address',
                cinemaProvince: '$showtimeId.roomId.cinema.province.label',
                cinemaDistrict: '$showtimeId.roomId.cinema.district.label',
                cinemaWard: '$showtimeId.roomId.cinema.ward.label',
            }
        },
        {
            $lookup: {
                from: 'seats',
                localField: 'ticketSeats.seatId',
                foreignField: '_id',
                as: 'ticketSeats.seat'
            }
        },
        {
            $lookup: {
                from: 'foods',
                localField: 'ticketFoods.foodId',
                foreignField: '_id',
                as: 'ticketFoods.food'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'users',
                pipeline: [
                    {
                        $project: { name: 1, email: 1, phone: 1},
                    },
                ],
            }
        },
        {
            $unwind: {
                path: '$users',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'voucheruses',
                localField: 'voucherUseId',
                foreignField: '_id',
                as: 'voucherUseId'
            }
        },
        {
            $unwind: {
                path: '$voucherUseId',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'vouchers',
                localField: 'voucherUseId.voucherId',
                foreignField: '_id',
                as: 'voucherUseId.voucherId',
                pipeline: [
                    {
                        $project: { voucherName: 1, discountValue: 1 }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: '$voucherUseId.voucherId',
                preserveNullAndEmptyArrays: true
            }
        },
        {
          $lookup: {
              from: 'paymentmethods',
              localField: 'paymentMethodId',
              foreignField: '_id',
              as: 'paymentMethodId'
          }
        },
        {
            $unwind: {
                path: '$paymentMethodId',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                'showtimeId.movieId': 0,
                'showtimeId.roomId': 0,
                bookingStatus: 0,
                paymentStatus: 0,
                appTransId: 0,
                transDate: 0
            }
        }
    ])

    if (!ticket || ticket.length === 0) {
        return next(new AppError("Không tìm thấy vé hợp lệ hoặc vé chưa thanh toán.", 404));
    }

    res.status(200).json({
        status: 'success',
        data: ticket[0]
    })
})
