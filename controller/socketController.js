const catchAsync = require("../utils/catchAsync");

const Booking = require("../model/bookingModel");
const mongoose = require("mongoose");

exports.handleSocketEvents = catchAsync(async (io, socket) => {
    //Tham gia phòng chiếu kèm theo xóa showtimeId cũ nếu có
    socket.on('join-room', async (data) => {
        const { showtimeId, userId } = data;
        if (!showtimeId) {
            socket.emit('error', { message: 'Phòng chiếu không tồn tại!' });
            return;
        }
        if (!userId) {
            socket.emit('error', { message: 'Vui lòng đăng nhập!' });
            return;
        }

        if (socket.currentShowtime) {
            socket.leave(socket.currentShowtime);
        }

        socket.join(showtimeId);
        socket.currentShowtime = showtimeId;
        socket.userId = userId;

        const allBookings = await Booking.find({ showtimeId });
        const holds = {};
        const bookings = {};
        allBookings.forEach(booking => {
            const seatId = booking.seatId.toString();
            if (booking.status === 'holding' || booking.status === 'pending') {
                holds[seatId] = booking.userId.toString();
            }else if(booking.status === 'success') {
                bookings[seatId] = booking.userId.toString();
            }
        });
        io.to(showtimeId).emit('seats-hold', {
            holds,
            bookings
        });
    });

    // Chọn Và Giữ ghế
    socket.on('hold-seat', async ({ showtimeId, seatId }) => {
        const userId = socket.userId;

        if (!showtimeId || !seatId || !userId) {
            socket.emit('error', { message: 'Phòng chiếu hoặc ghế không tồn tại!' });
            return;
        }

        // Check xem seatId có phải là ObjectId hợp lệ không
        if(!mongoose.Types.ObjectId.isValid(seatId)) {
            socket.emit('error', { message: 'Ghế không hợp lệ!' });
            return;
        }

        const existing = await Booking.findOne({ seatId, showtimeId });

        if (existing) {
            if (existing.userId.toString() !== userId.toString()) {
                socket.emit('error', { message: 'Ghế đang được giữ bởi người khác!' });
                return;
            }
        }
        await Booking.findOneAndUpdate(
            { seatId, showtimeId },
            {
                seatId,
                showtimeId,
                userId,
                status: 'holding',
            },
            { upsert: true, new: true }
        );

        socket.to(showtimeId).emit('seat-held', { seatId, userId });
        socket.emit('seats-held-me', { seatId });
    });

    // Huỷ giữ ghế
    socket.on('release-seat', async ({ showtimeId, seatId }) => {
        const userId = socket.userId;
        if (!showtimeId || !seatId) {
            socket.emit('error', { message: 'Phòng chiếu hoặc ghế không tồn tại!' });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(seatId)) {
            socket.emit('error', { message: 'Ghế không hợp lệ!' });
            return;
        }

        const result = await Booking.findOneAndDelete({
            seatId,
            showtimeId,
            userId,
            status: 'holding'
        });

        // Chỉ được huỷ nếu là người giữ ghế đó
        if (
            result
        ) {
            io.to(showtimeId).emit('seat-released', { seatId });
        }else{
            socket.emit('error', { message: 'Bạn không có quyền huỷ giữ ghế này!' });
        }
    });

    // Đặt ghế đã giữ
    socket.on('book-seat', async ({ showtimeId }) => {
        const userId = socket.userId;
        if (!showtimeId) {
            socket.emit('error', { message: 'Phòng chiếu không tồn tại!' });
            return;
        }

        await Booking.updateMany(
            { showtimeId, userId, status: 'holding' },
            { $set: { status: 'pending' } }
        );

        await Booking.find({ showtimeId, status: 'pending' });
    });

    //Rời khỏi phòng chiếu
    socket.on('disconnect', async () => {
        const userId = socket.userId;
        const showtimeId = socket.currentShowtime;


        const releasedSeats = await Booking.find({
            userId,
            showtimeId,
            status: { $in: ['holding'] }
        });

        await Booking.deleteMany({
            userId,
            showtimeId,
            status: { $in: ['holding'] }
        });


        // Gửi danh sách ghế được huỷ về client khác
        releasedSeats.forEach(seat => {
            io.to(showtimeId).emit('seat-released', { seatId: seat.seatId });
        });
    });
});

