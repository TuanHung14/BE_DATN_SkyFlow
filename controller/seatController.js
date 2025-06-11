const Seat = require('../model/seatModel');
const Room = require('../model/roomModel');
const catchAsync = require('../utils/catchAsync');

exports.createSeat = async (req, res) => {
    const {roomId, seatRow, seatNumber, seatType, status} = req.body;

    const room = await Room.findOne({_id: roomId, isDeleted: false});
    if (!room) {
        return res.status(404).json({message: 'Không tìm thấy phòng chiếu hoặc phòng đã bị xóa'});
    }

    if (!seatRow || !/^[A-Z]$/.test(seatRow)) {
        return res.status(400).json({message: 'Hàng ghế phải là một chữ cái in hoa (A-Z)'});
    }
    if (!Number.isInteger(seatNumber) || seatNumber < 1 || seatNumber > 150) {
        return res.status(400).json({message: 'Số ghế phải là số nguyên từ 1 đến 150'});
    }
    if (seatType && !['standard', 'vip', 'couple'].includes(seatType)) {
        return res.status(400).json({message: 'Loại ghế không hợp lệ'});
    }
    if (status && !['active', 'inactive'].includes(status)) {
        return res.status(400).json({message: 'Trạng thái không hợp lệ'});
    }

    // **Lưu ý**: Middleware pre-save của schema kiểm tra sức chứa và ghế trùng lặp
    const seat = new Seat({
        roomId,
        seatRow,
        seatNumber,
        seatType: seatType || 'standard',
        status: status || 'active',
    });

    await seat.save();
    return res.status(201).json({message: 'Tạo ghế thành công', seat});
};

exports.getAllSeats = catchAsync(async (req, res, next) => {
    const seats = await Seat.find();
    res.status(200).json({
        status: 'success',
        results: seats.length,
        data: {
            seats
        }
    })
})

exports.bulkCreateSeats = async (req, res) => {
    const {roomId, seats} = req.body;

    // Kiểm tra đầu vào
    const room = await Room.findOne({_id: roomId, isDeleted: false});
    if (!room) {
        return res.status(404).json({message: 'Không tìm thấy phòng chiếu hoặc phòng đã bị xóa'});
    }

    if (!Array.isArray(seats) || seats.length === 0) {
        return res.status(400).json({message: 'Danh sách ghế phải là mảng không rỗng'});
    }

    // Kiểm tra sức chứa
    const currentSeatCount = await Seat.countDocuments({roomId});
    if (currentSeatCount + seats.length > room.capacity) {
        return res.status(400).json({message: 'Tổng số ghế vượt quá sức chứa phòng'});
    }

    // Kiểm tra từng ghế
    for (const seat of seats) {
        if (!seat.seatRow || !/^[A-Z]$/.test(seat.seatRow)) {
            return res.status(400).json({message: 'Hàng ghế phải là một chữ cái in hoa (A-Z)'});
        }
        if (!Number.isInteger(seat.seatNumber) || seat.seatNumber < 1 || seat.seatNumber > 150) {
            return res.status(400).json({message: 'Số ghế phải là số nguyên từ 1 đến 150'});
        }
        if (seat.seatType && !['standard', 'vip', 'couple'].includes(seat.seatType)) {
            return res.status(400).json({message: 'Loại ghế không hợp lệ'});
        }
        if (seat.status && !['active', 'inactive'].includes(seat.status)) {
            return res.status(400).json({message: 'Trạng thái không hợp lệ'});
        }
    }

    // **Lưu ý**: Sử dụng insertMany để tạo hàng loạt
    const seatDocs = seats.map((seat) => ({
        roomId,
        seatRow: seat.seatRow,
        seatNumber: seat.seatNumber,
        seatType: seat.seatType || 'standard',
        status: seat.status || 'active',
    }));

    const createdSeats = await Seat.insertMany(seatDocs, {ordered: false});

    return res.status(201).json({message: 'Tạo hàng loạt ghế thành công', seats: createdSeats});
};