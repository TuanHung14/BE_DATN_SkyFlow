const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const Ticket = require('../model/ticketModel');
const Seat = require('../model/seatModel');
const Food = require('../model/foodModel');
const Showtime = require('../model/showtimeModel');
const PriceRule = require('../model/priceRuleModel');
const Voucher = require('../model/voucherModel');
const TicketFood = require('../model/ticketFoodModel');
const TicketSeat = require('../model/ticketSeatModel');

exports.createTicket = catchAsync(async (req, res, next) => {
    const { showtimeId, seatsId, foodsId, paymentMethodId, voucherId } = req.body;

    if (!req.user || !req.user.id) {
        return next(new Error('User not authenticated'));
    }
    const userId = req.user.id;

    if (!showtimeId || !seatsId?.length || !paymentMethodId) {
        return next(new Error('Vui lòng cung cấp suất chiếu, ghế và phương thức thanh toán'));
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    let isTransactionCommitted = false;

    try {
        // Kiểm tra suất chiếu
        const showtime = await Showtime.findById(showtimeId)
            .populate('formatId')
            .session(session);
        if (!showtime || showtime.status !== 'Available') {
            throw new Error('Suất chiếu không tồn tại hoặc không khả dụng');
        }

        // Kiểm tra ghế trong database
        const seatIds = seatsId.map(s => s.seatId);
        const seats = await Seat.find({ _id: { $in: seatIds } }).session(session);
        if (seats.length !== seatIds.length) {
            throw new Error('Một số ghế không tồn tại');
        }
        const invalidSeats = seats.filter(seat => seat.status !== 'Available');
        if (invalidSeats.length > 0) {
            throw new Error('Một số ghế đã được đặt hoặc không khả dụng');
        }

        // Kiểm tra đồ ăn
        const foodPrices = foodsId?.length ? await Promise.all(foodsId.map(async ({ foodId, quantity }) => {
            const food = await Food.findById(foodId).session(session);
            console.log(food);
            if (!food || !food.status || food.inventory_count < quantity) {
                throw new Error(`Thức ăn ${food?.name || 'này'} không đủ số lượng hoặc không khả dụng`);
            }
            return { foodId, quantity, price: food.price * quantity, priceAtPurchase: food.price };
        })) : [];

        // Tính giá ghế
        const seatPrices = await Promise.all(seatsId.map(async ({ seatId }) => {
            const seat = seats.find(s => s._id.equals(seatId));
            const priceRule = await PriceRule.findOne({
                seatType: seat.seatType,
                format: showtime.formatId.name
            }).session(session);
            if (!priceRule) {
                throw new Error(`Không tìm thấy quy tắc giá cho loại ghế ${seat.seatType} và định dạng ${showtime.formatId.name}`);
            }
            return { seatId, price: priceRule.price };
        }));

        // Tính tổng giá
        let totalAmount = seatPrices.reduce((sum, item) => sum + item.price, 0) +
            foodPrices.reduce((sum, item) => sum + item.price, 0, 0);

        // Áp dụng voucher
        let discount = 0;
        if (voucherId) {
            const voucher = await Voucher.findById(voucherId).session(session);
            if (voucher && voucher.is_active) {
                discount = voucher.discount_value;
                totalAmount = Math.max(0, totalAmount - discount);
            }
        }

        // Kiểm tra model Ticket
        if (!Ticket || typeof Ticket.create !== 'function') {
            throw new Error('Ticket model is not properly defined');
        }

        // Tạo vé
        const ticket = await Ticket.create([{
            bookingDate: new Date(),
            totalAmount,
            paymentStatus: 'Paid',
            bookingStatus: 'Confirmed',
            showtimeId,
            paymentMethodId,
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
        await Seat.updateMany(
            { _id: { $in: seatIds } },
            { status: 'Occupied' },
            { session }
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

        // chổ này chưa xử lý được
        const io = req.app.get('io');
        if (io) {
            io.to(showtimeId).emit('seats-booked', seatIds.map(seatId => ({ seatId, status: 'Occupied' })));
        } else {
            console.warn('WebSocket io not initialized, skipping seats-booked event');
        }

        res.status(201).json({
            status: 'success',
            data: {
                ticketId: ticket[0]._id,
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
    const tickets = await Ticket.find({ userId: req.user.id })
        .populate('showtimeId paymentMethodId seatsId.seatId foodsId.foodId')
        .sort({ bookingDate: -1 });

    res.status(200).json({
        status: 'success',
        data: tickets
    });
});