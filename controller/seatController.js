const Seat = require('../model/seatModel');``
const Room = require('../model/roomModel');
const Showtime = require("../model/showtimeModel");
const Booking = require("../model/bookingModel");
const catchAsync = require('../utils/catchAsync');
const mongoose = require('mongoose');
const AppError = require("../utils/appError");

exports.getAllSeat = catchAsync(async (req, res, next) => {
    const { showtimeId } = req.params;

    const showtime = await Showtime.findOne({
        _id: showtimeId,
        status: "scheduled",
        isDeleted: false,
    });

    if(!showtime){
        return next(new AppError('Không có lịch chiếu này', 404));
    }

    const seats = await Seat.find({ roomId: showtime.roomId, hidden: 'false' });

    const activeBookings = await Booking.find({
        showtimeId,
        status: { $in: ['success', 'pending'] },
    });

    const bookingMap = {};
    activeBookings.forEach(booking => {
        bookingMap[booking.seatId.toString()] = booking;
    });

    const seatsWithStatus = seats.map(seat => {
        const booking = bookingMap[seat._id.toString()];

        return {
            ...seat.toObject(),
            isAvailable: !booking,
            // status: booking ? booking.status : null
        };
    });

    res.status(200).json({
        status: 'success',
        data: {
            ...seatsWithStatus,
            format: showtime.formatId
        }
    });
});

exports.getAllSeatByRoom = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const seats = await Seat.find({ roomId: id, hidden: false }).lean();

    res.status(200).json({
        status: 'success',
        data: seats
    })
})

exports.createSeat = catchAsync(async (req, res, next) => {
    const seatsData = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const roomId = seatsData[0].roomId;
        const room = await Room.findById(roomId).session(session);
        if (!room) {
           return next(new AppError('Phòng không tồn tại!', 404));
        }

        const seatsToCreate = seatsData.map(seat => ({
            roomId: seat.roomId,
            seatRow: seat.seatRow.toUpperCase(),
            seatNumber: parseInt(seat.seatNumber),
            seatType: seat.seatType || 'normal',
            hidden: false,
            coupleId: null,
            coupleDisplayName: null
        }));

        const numberOfSeats = seatsToCreate.length;

        const savedSeats = await Seat.insertMany(seatsToCreate, { session });

        await Room.updateOne(
            { _id: roomId },
            { $inc: { capacity: numberOfSeats } },
            { session }
        )

        await session.commitTransaction();
        res.status(201).json({
            status: 'success',
            message: 'Các ghế đã được thêm thành công',
            data: savedSeats
        });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    } finally {
        session.endSession();
    }
});

exports.updateSeat = catchAsync(async (req, res, next) => {
    const { seats, seatType, roomId } = req.body;
    const seatList = seats.split(',').map(seat => seat.trim()).filter(seat => seat);

    if (!seatList.length) {
        return next(new AppError('Danh sách ghế không hợp lệ', 400));
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const updatedSeatIds = [];
        if (seatType === 'couple') {
            if (seatList.length === 1 && mongoose.isValidObjectId(seatList[0])) {
                const seat = await Seat.findOne({
                    _id: seatList[0],
                    roomId,
                    seatType: 'couple',
                    hidden: false
                }).session(session);

                if (!seat) {
                    return next(new AppError(`Ghế ${seatList[0]} không phải ghế đôi hợp lệ`, 404));
                }
                updatedSeatIds.push(seat._id);
            } else {
                if (seatList.length % 2 !== 0) {
                    return next(new AppError('Số lượng ghế phải là số chẵn để tạo ghế đôi', 400));
                }

                const sortedSeats = seatList.sort((a, b) => {
                    const [rowA, numA] = [a[0], parseInt(a.slice(1))];
                    const [rowB, numB] = [b[0], parseInt(b.slice(1))];
                    return rowA !== rowB ? rowA.localeCompare(rowB) : numA - numB;
                });

                for (let i = 0; i < sortedSeats.length; i += 2) {
                    const [seatCode, nextSeatCode] = [sortedSeats[i], sortedSeats[i + 1]];
                    const match1 = seatCode.match(/^([A-Z])(\d+)$/);
                    const match2 = nextSeatCode.match(/^([A-Z])(\d+)$/);

                    if (!match1 || !match2) {
                        return next(new AppError(`Mã ghế ${seatCode} hoặc ${nextSeatCode} không hợp lệ`, 400));
                    }

                    const [seatRow, seatNumber] = [match1[1], parseInt(match1[2])];
                    const [nextSeatRow, nextSeatNumber] = [match2[1], parseInt(match2[2])];

                    if (seatRow !== nextSeatRow || nextSeatNumber !== seatNumber + 1) {
                        return next(new AppError(`Ghế ${seatCode} và ${nextSeatCode} không liền kề`, 400));
                    }

                    const seats = await Seat.find({
                        $or: [
                            { seatRow, seatNumber, roomId, hidden: false },
                            { seatRow: nextSeatRow, seatNumber: nextSeatNumber, roomId, hidden: false }
                        ]
                    }).session(session);

                    if (seats.length !== 2 || seats.some(seat => seat.coupleId)) {
                        return next(new AppError(`Ghế ${seatCode} hoặc ${nextSeatCode} không hợp lệ hoặc đã thuộc ghế đôi`, 400));
                    }

                    const coupleId = new mongoose.Types.ObjectId();
                    const coupleDisplayName = `${seatRow}${seatNumber}-${nextSeatRow}${nextSeatNumber}`;

                    // Cập nhật ghế đầu tiên (hiện)
                    await Seat.updateOne(
                        { _id: seats[0]._id },
                        {
                            seatType: 'couple',
                            coupleId,
                            coupleDisplayName,
                            hidden: false
                        },
                        { session }
                    );

                    // Cập nhật ghế thứ hai (ẩn)
                    await Seat.updateOne(
                        { _id: seats[1]._id },
                        {
                            seatType: 'couple',
                            coupleId,
                            coupleDisplayName,
                            hidden: true
                        },
                        { session }
                    );
                    updatedSeatIds.push(seats[0]._id, seats[1]._id);
                }
            }
        } else {
            for (const seatCode of seatList) {
                if (mongoose.isValidObjectId(seatCode)) {
                    const coupleSeat = await Seat.findOne({
                        _id: seatCode,
                        roomId,
                        seatType: 'couple',
                        hidden: false
                    }).session(session);

                    if (!coupleSeat?.coupleId) {
                        return next(new AppError(`Ghế ${seatCode} không phải ghế đôi hợp lệ`, 404));
                    }

                    const coupleSeats = await Seat.find({
                        coupleId: coupleSeat.coupleId,
                        roomId
                    }).session(session);

                    if (coupleSeats.length !== 2) {
                        return next(new AppError(`Ghế đôi ${seatCode} có dữ liệu không hợp lệ`, 400));
                    }

                    await Seat.updateMany(
                        { coupleId: coupleSeat.coupleId, roomId },
                        { seatType, coupleId: null, coupleDisplayName: null, hidden: false },
                        { session }
                    );
                    updatedSeatIds.push(...coupleSeats.map(s => s._id));
                } else {
                    const match = seatCode.match(/^([A-Z])(\d+)$/);
                    if (!match) {
                        return next(new AppError(`Mã ghế ${seatCode} không hợp lệ`, 400));
                    }

                    const [, seatRow, seatNumber] = match;
                    const number = parseInt(seatNumber);

                    const seat = await Seat.findOne({
                        seatRow,
                        seatNumber: number,
                        roomId,
                        hidden: false,
                        coupleId: null
                    }).session(session);

                    if (!seat) {
                        return next(new AppError(`Ghế ${seatCode} không tồn tại hoặc không hợp lệ`, 404));
                    }

                    await Seat.updateOne(
                        { _id: seat._id },
                        { seatType, coupleId: null, coupleDisplayName: null },
                        { session }
                    );
                    updatedSeatIds.push(seat._id);
                }
            }
        }

        const updatedSeats = await Seat.find({ _id: { $in: updatedSeatIds } })
            .lean()
            .session(session);

        await session.commitTransaction();

        res.status(200).json({
            status: 'success',
            message: 'Cập nhật ghế thành công',
            seats: updatedSeats.map(seat => ({
                _id: seat._id,
                roomId: seat.roomId,
                seatRow: seat.seatRow || null,
                seatNumber: seat.seatNumber || null,
                seatType: seat.seatType,
                status: seat.status,
                coupleId: seat.coupleId || null,
                coupleDisplayName: seat.coupleDisplayName || null,
                hidden: seat.hidden
            }))
        });
    } catch (error) {
        await session.abortTransaction();
        return next(new AppError(error.message, 400));
    } finally {
        session.endSession();
    }
});