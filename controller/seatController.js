const Seat = require('../model/seatModel');
const Room = require('../model/roomModel');
const Showtime = require("../model/showtimeModel");
const catchAsync = require('../utils/catchAsync');
const mongoose = require('mongoose');
const Factory = require("./handleFactory");


// exports.getAllSeat = Factory.getAll(Seat, "roomId");

exports.getAllSeat = catchAsync(async (req, res, next) => {
    let seats = [];

    if (req.query.showtimeId) {
        // Tìm showtime để lấy roomId
        const showtime = await Showtime.findById(req.query.showtimeId);
        if (!showtime) {
            return next(new Error('Không tìm thấy suất chiếu'));
        }

        // Lấy tất cả ghế của phòng chiếu
        seats = await Seat.find({ roomId: showtime.roomId });
    } else if (req.query.roomId) {
        // Giữ logic cũ cho roomId
        seats = await Seat.find({ roomId: req.query.roomId });
    } else {
        // Lấy tất cả ghế nếu không có query
        seats = await Seat.find();
    }

    res.status(200).json({
        status: 'success',
        data: seats
    });
});

exports.createSeat = catchAsync(async (req, res, next) => {
    const seatsData = req.body;

    // Kiểm tra dữ liệu đầu vào là mảng và không rỗng
    if (!Array.isArray(seatsData) || seatsData.length === 0) {
        return res.status(400).json({ message: 'Dữ liệu đầu vào phải là mảng ghế không rỗng' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    // Lấy roomId từ mảng dữ liệu (giả sử tất cả ghế thuộc cùng một phòng)
    const roomId = seatsData[0].roomId;
    if (!roomId) {
        await session.abortTransaction();
        return next(new Error('roomId là bắt buộc'));
    }

    // Kiểm tra phòng tồn tại và capacity
    const room = await Room.findById(roomId).session(session);
    if (!room) {
        await session.abortTransaction();
        return next(new Error('Phòng không tồn tại'));
    }

    const currentSeats = await Seat.countDocuments({ roomId }).session(session);
    if (currentSeats + seatsData.length > room.capacity) {
        await session.abortTransaction();
        return next(new Error('Số lượng ghế vượt quá giới hạn của phòng'));
    }

    // Chuẩn hóa dữ liệu
    const seatsToCreate = seatsData.map(seat => ({
        roomId: seat.roomId,
        seatRow: seat.seatRow,
        seatNumber: seat.seatNumber,
        seatType: seat.seatType || 'normal',
        status: seat.status || 'Available'
    }));

    // Sử dụng insertMany với session để đảm bảo giao dịch
    const savedSeats = await Seat.insertMany(seatsToCreate, { session });

    await session.commitTransaction();
    res.status(201).json({
        message: 'Các ghế đã được thêm thành công',
        data: savedSeats
    });

    session.endSession();
});

exports.updateSeat = catchAsync(async (req, res, next) => {
    const { seats, seatType } = req.body;

    if (!seats || !seatType) {
        return res.status(400).json({ message: 'Vui lòng cung cấp danh sách ghế và loại ghế' });
    }

    const seatList = seats.split(',').map(seat => seat.trim());
    if (seatList.length === 0) {
        return res.status(400).json({ message: 'Danh sách ghế không hợp lệ' });
    }

    const validTypes = ['normal', 'vip', 'couple'];
    if (!validTypes.includes(seatType)) {
        return res.status(400).json({ message: 'Loại ghế không hợp lệ' });
    }

    const errors = [];

    if (seatType === 'couple') {
        // Sắp xếp seatList để kiểm tra cặp liền kề
        const sortedSeats = seatList.sort((a, b) => {
            const [rowA, numA] = [a[0], parseInt(a.slice(1))];
            const [rowB, numB] = [b[0], parseInt(b.slice(1))];
            if (rowA !== rowB) return rowA.localeCompare(rowB);
            return numA - numB;
        });

        for (let i = 0; i < sortedSeats.length - 1; i++) {
            const [seatRow, seatNumber] = [sortedSeats[i][0], parseInt(sortedSeats[i].slice(1))];
            const nextSeatCode = sortedSeats[i + 1];
            const [nextSeatRow, nextSeatNumber] = [nextSeatCode[0], parseInt(nextSeatCode.slice(1))];

            if (seatRow !== nextSeatRow || nextSeatNumber !== seatNumber + 1) {
                errors.push(`Ghế ${sortedSeats[i]} và ${nextSeatCode} không liền kề để tạo couple`);
                continue;
            }

            const seat = await Seat.findOne({ seatRow, seatNumber, roomId: req.body.roomId });
            const nextSeat = await Seat.findOne({ seatRow: nextSeatRow, seatNumber: nextSeatNumber, roomId: req.body.roomId });

            if (!seat || !nextSeat) {
                errors.push(`Ghế ${sortedSeats[i]} hoặc ${nextSeatCode} không tồn tại`);
                continue;
            }

            await Seat.updateMany(
                { seatRow, seatNumber: { $in: [seatNumber, nextSeatNumber] } },
                { seatType: 'couple', status: 'Available' }
            );
        }

        if (sortedSeats.length % 2 !== 0) {
            errors.push('Số lượng ghế phải là số chẵn để tạo couple');
        }
    } else {
        const updatePromises = seatList.map(async (seatCode) => {
            const [seatRow, seatNumber] = [seatCode[0], parseInt(seatCode.slice(1))];

            if (!/^[A-Z]$/.test(seatRow) || isNaN(seatNumber) || seatNumber < 1 || seatNumber > 150) {
                errors.push(`Ghế ${seatCode} không hợp lệ`);
                return;
            }

            const seat = await Seat.findOne({ seatRow, seatNumber, roomId: req.body.roomId });
            if (!seat) {
                errors.push(`Ghế ${seatCode} không tồn tại`);
                return;
            }

            await Seat.updateOne(
                { seatRow, seatNumber, roomId: req.body.roomId },
                { seatType, status: 'Available' }
            );
        });

        await Promise.all(updatePromises);
    }

    if (errors.length > 0) {
        return next(new Error(errors.join(', ')));
    }

    res.status(200).json({ message: 'Cập nhật ghế thành công' });
});
