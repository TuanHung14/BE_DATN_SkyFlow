const Seat = require('../model/seatModel');
const Room = require('../model/roomModel');
const Showtime = require("../model/showtimeModel");
const catchAsync = require('../utils/catchAsync');
const mongoose = require('mongoose');

exports.getAllSeat = catchAsync(async (req, res, next) => {
    let seats = [];

    // Xây dựng query dựa trên tham số
    const query = { hidden: false };
    if (req.query.showtimeId) {
        const showtime = await Showtime.findById(req.query.showtimeId);
        if (!showtime) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không tìm thấy suất chiếu'
            });
        }
        query.roomId = showtime.roomId;
    } else if (req.query.roomId) {
        query.roomId = req.query.roomId;
    }

    // Lấy danh sách ghế
    seats = await Seat.find(query).lean();

    // Chọn các trường cần thiết
    const responseSeats = seats.map(seat => ({
        _id: seat._id,
        roomId: seat.roomId,
        seatRow: seat.seatRow || null,
        seatNumber: seat.seatNumber || null,
        seatType: seat.seatType,
        status: seat.status,
        coupleId: seat.coupleId || null,
        coupleDisplayName: seat.coupleDisplayName || null,
        hidden: seat.hidden
    }));

    res.status(200).json({
        status: 'success',
        seats: responseSeats
    });
});

exports.createSeat = catchAsync(async (req, res, next) => {
    const seatsData = req.body;

    if (!Array.isArray(seatsData) || seatsData.length === 0) {
        return res.status(400).json({
            status: 'fail',
            message: 'Dữ liệu đầu vào phải là mảng ghế không rỗng'
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const roomId = seatsData[0].roomId;
        if (!mongoose.isValidObjectId(roomId)) {
            throw new Error('Room ID không hợp lệ');
        }

        const room = await Room.findById(roomId).session(session);
        if (!room) {
            throw new Error('Phòng không tồn tại');
        }

        const currentSeats = await Seat.countDocuments({ roomId }).session(session);
        if (currentSeats + seatsData.length > room.capacity) {
            throw new Error('Số lượng ghế vượt quá giới hạn của phòng');
        }

        const seatsToCreate = seatsData.map(seat => {
            if (!seat.seatRow || !seat.seatNumber) {
                throw new Error('seatRow và seatNumber là bắt buộc cho ghế đơn');
            }
            if (!/^[A-Z]$/.test(seat.seatRow) || !Number.isInteger(parseInt(seat.seatNumber)) || seat.seatNumber < 1 || seat.seatNumber > 150) {
                throw new Error(`Ghế ${seat.seatRow}${seat.seatNumber} không hợp lệ`);
            }
            return {
                roomId: seat.roomId,
                seatRow: seat.seatRow.toUpperCase(),
                seatNumber: parseInt(seat.seatNumber),
                seatType: seat.seatType || 'normal',
                status: seat.status || 'Available',
                hidden: false,
                coupleId: null,
                coupleDisplayName: null
            };
        });

        for (const seat of seatsToCreate) {
            const existingSeat = await Seat.findOne({
                roomId: seat.roomId,
                seatRow: seat.seatRow,
                seatNumber: seat.seatNumber
            }).session(session);
            if (existingSeat) {
                throw new Error(`Ghế ${seat.seatRow}${seat.seatNumber} đã tồn tại trong phòng`);
            }
        }

        const savedSeats = await Seat.insertMany(seatsToCreate, { session });

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

    // Validation đầu vào
    if (!seats || !seatType || !roomId) {
        return res.status(400).json({
            status: 'fail',
            message: 'Vui lòng cung cấp danh sách ghế, loại ghế và ID phòng'
        });
    }

    if (!mongoose.isValidObjectId(roomId)) {
        return res.status(400).json({
            status: 'fail',
            message: 'Room ID không hợp lệ'
        });
    }

    const seatList = seats.split(',').map(seat => seat.trim()).filter(seat => seat);
    if (seatList.length === 0) {
        return res.status(400).json({
            status: 'fail',
            message: 'Danh sách ghế không hợp lệ'
        });
    }

    const validTypes = ['normal', 'vip', 'couple'];
    if (!validTypes.includes(seatType)) {
        return res.status(400).json({
            status: 'fail',
            message: 'Loại ghế không hợp lệ'
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Kiểm tra phòng tồn tại
        const room = await Room.findById(roomId).session(session);
        if (!room) {
            throw new Error('Phòng không tồn tại');
        }

        const errors = [];

        if (seatType === 'couple') {
            // Kiểm tra số ghế chẵn
            if (seatList.length % 2 !== 0 && !mongoose.isValidObjectId(seatList[0])) {
                errors.push('Số lượng ghế phải là số chẵn để tạo ghế đôi hoặc cung cấp ID ghế đôi');
                throw new Error();
            }

            // Xử lý ghế đôi đã tồn tại
            if (seatList.length === 1 && mongoose.isValidObjectId(seatList[0])) {
                const seat = await Seat.findOne({ _id: seatList[0], roomId, hidden: false }).session(session);
                if (!seat || seat.seatType !== 'couple') {
                    errors.push(`Ghế ${seatList[0]} không tồn tại hoặc không phải ghế đôi`);
                    throw new Error();
                }
            } else {
                // Tạo ghế đôi mới từ ghế đơn
                const sortedSeats = seatList.sort((a, b) => {
                    const [rowA, numA] = [a[0], parseInt(a.slice(1))];
                    const [rowB, numB] = [b[0], parseInt(b.slice(1))];
                    if (rowA !== rowB) return rowA.localeCompare(rowB);
                    return numA - numB;
                });

                for (let i = 0; i < sortedSeats.length; i += 2) {
                    const seatCode = sortedSeats[i];
                    const nextSeatCode = sortedSeats[i + 1];

                    // Validation mã ghế
                    if (!/^[A-Z]\d+$/.test(seatCode) || !/^[A-Z]\d+$/.test(nextSeatCode)) {
                        errors.push(`Ghế ${seatCode} hoặc ${nextSeatCode} có định dạng không hợp lệ`);
                        continue;
                    }

                    const [seatRow, seatNumber] = [seatCode[0], parseInt(seatCode.slice(1))];
                    const [nextSeatRow, nextSeatNumber] = [nextSeatCode[0], parseInt(nextSeatCode.slice(1))];

                    // Kiểm tra ghế hợp lệ
                    if (!/^[A-Z]$/.test(seatRow) || !/^[A-Z]$/.test(nextSeatRow) || seatNumber < 1 || seatNumber > 150 || nextSeatNumber < 1 || nextSeatNumber > 150) {
                        errors.push(`Ghế ${seatCode} hoặc ${nextSeatCode} không hợp lệ`);
                        continue;
                    }

                    // Kiểm tra ghế liền kề
                    if (seatRow !== nextSeatRow || nextSeatNumber !== seatNumber + 1) {
                        errors.push(`Ghế ${seatCode} và ${nextSeatCode} không liền kề để tạo ghế đôi`);
                        continue;
                    }

                    // Tìm ghế trong DB
                    const seat = await Seat.findOne({ seatRow, seatNumber, roomId, hidden: false }).session(session);
                    const nextSeat = await Seat.findOne({ seatRow: nextSeatRow, seatNumber: nextSeatNumber, roomId, hidden: false }).session(session);

                    if (!seat || !nextSeat) {
                        errors.push(`Ghế ${seatCode} hoặc ${nextSeatCode} không tồn tại hoặc đã ẩn`);
                        continue;
                    }

                    // Kiểm tra ghế đã thuộc ghế đôi
                    if (seat.coupleId || nextSeat.coupleId) {
                        errors.push(`Ghế ${seatCode} hoặc ${nextSeatCode} đã thuộc một ghế đôi khác`);
                        continue;
                    }

                    // Kiểm tra trạng thái ghế
                    if (seat.status !== 'Available' || nextSeat.status !== 'Available') {
                        errors.push(`Ghế ${seatCode} hoặc ${nextSeatCode} không khả dụng`);
                        continue;
                    }

                    // Kiểm tra capacity phòng
                    const currentSeats = await Seat.countDocuments({ roomId, hidden: false }).session(session);
                    if (currentSeats >= room.capacity) {
                        errors.push('Số lượng ghế hiển thị đã đạt giới hạn của phòng');
                        continue;
                    }

                    // Tạo ghế đôi bằng cách sử dụng ghế đầu tiên
                    const coupleId = new mongoose.Types.ObjectId();
                    const coupleDisplayName = `${seatRow}${seatNumber}-${nextSeatRow}${nextSeatNumber}`;

                    // Cập nhật ghế đầu tiên thành ghế đôi chính (hiển thị)
                    await Seat.updateOne(
                        { _id: seat._id },
                        {
                            seatType: 'couple',
                            coupleId,
                            coupleDisplayName,
                            hidden: false,
                            status: 'Available'
                        },
                        { session }
                    );

                    // Ẩn ghế thứ hai (không hiển thị nhưng vẫn liên kết)
                    await Seat.updateOne(
                        { _id: nextSeat._id },
                        {
                            seatType: 'couple',
                            coupleId,
                            coupleDisplayName,
                            hidden: true,
                            status: 'Available'
                        },
                        { session }
                    );
                }
            }
        } else {
            // Xử lý ghế normal và vip
            for (const seatCode of seatList) {
                if (!/^[A-Z]\d+$/.test(seatCode)) {
                    errors.push(`Ghế ${seatCode} có định dạng không hợp lệ`);
                    continue;
                }

                const [seatRow, seatNumber] = [seatCode[0], parseInt(seatCode.slice(1))];

                if (!/^[A-Z]$/.test(seatRow) || isNaN(seatNumber) || seatNumber < 1 || seatNumber > 150) {
                    errors.push(`Ghế ${seatCode} không hợp lệ`);
                    continue;
                }

                const seat = await Seat.findOne({ seatRow, seatNumber, roomId, hidden: false }).session(session);
                if (!seat) {
                    errors.push(`Ghế ${seatCode} không tồn tại hoặc đã ẩn`);
                    continue;
                }

                if (seat.coupleId) {
                    errors.push(`Ghế ${seatCode} thuộc ghế đôi, không thể đổi loại`);
                    continue;
                }

                await Seat.updateOne(
                    { _id: seat._id },
                    { seatType, status: 'Available', coupleId: null, coupleDisplayName: null, hidden: false },
                    { session }
                );
            }
        }

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }

        await session.commitTransaction();

        // Lấy danh sách ghế cập nhật
        const updatedSeats = await Seat.find({ roomId, hidden: false }).lean();
        const responseSeats = updatedSeats.map(seat => ({
            _id: seat._id,
            roomId: seat.roomId,
            seatRow: seat.seatRow || null,
            seatNumber: seat.seatNumber || null,
            seatType: seat.seatType,
            status: seat.status,
            coupleId: seat.coupleId || null,
            coupleDisplayName: seat.coupleDisplayName || null,
            hidden: seat.hidden
        }));

        res.status(200).json({
            status: 'success',
            message: 'Cập nhật ghế thành công',
            seats: responseSeats
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