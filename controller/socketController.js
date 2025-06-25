const catchAsync = require("../utils/catchAsync");

const seatHolds = {}; // { showtimeId: { seatId: socketId } }

const seatBooking = {}; // { showtimeId: { seatId: { socketId, status } }

exports.handleSocketEvents = catchAsync(async (io, socket) => {
    //Tham gia phòng chiếu kèm theo xóa showtimeId cũ nếu có
    socket.on('join-room', (data) => {
        const showtimeId = data.showtimeId;
        if (!showtimeId) {
            socket.emit('error', { message: 'Phòng chiếu không tồn tại!' });
            return;
        }

        if (socket.currentShowtime) {
            socket.leave(socket.currentShowtime);
        }

        socket.join(showtimeId);
        socket.currentShowtime = showtimeId;
        // Gửi các ghế đang giữ
        socket.emit('seats-hold', {
            holds: seatHolds[showtimeId] || {},
            bookings: seatBooking[showtimeId] || {}
        });
    });

    // Chọn Và Giữ ghế
    socket.on('hold-seat', ({ showtimeId, seatId }) => {
        if (!showtimeId || !seatId) {
            socket.emit('error', { message: 'Phòng chiếu hoặc ghế không tồn tại!' });
            return;
        }

        if (!seatHolds[showtimeId]) seatHolds[showtimeId] = {};

        // Nếu ghế đã bị giữ bởi người khác thì không cho giữ
        if (seatHolds[showtimeId][seatId] === socket.id) {
            socket.emit('error', { message: 'Ghế đang được giữ bởi người khác' });
            return;
        }

        // Giữ ghế
        seatHolds[showtimeId][seatId] = socket.id;

        socket.to(showtimeId).emit('seat-held', { seatId });
        socket.emit('seats-held-me', { seatId });
    });

    // Huỷ giữ ghế
    socket.on('release-seat', ({ showtimeId, seatId }) => {
        if (!showtimeId || !seatId) {
            socket.emit('error', { message: 'Phòng chiếu hoặc ghế không tồn tại!' });
            return;
        }

        // Chỉ được huỷ nếu là người giữ ghế đó
        if (
            seatHolds[showtimeId] &&
            seatHolds[showtimeId][seatId] === socket.id
        ) {
            delete seatHolds[showtimeId][seatId];
            io.to(showtimeId).emit('seat-released', { seatId });
        }
    });

    // Huỷ giữ tất cả ghế đã đặt
    socket.on('release-booking-seats', ({ showtimeId }) => {
        if (!showtimeId) {
            socket.emit('error', { message: 'Phòng chiếu không tồn tại!' });
            return;
        }

       if(
            !seatBooking[showtimeId]
        ) {
            socket.emit('error', { message: 'Không có ghế nào được đặt!' });
            return;
        }
        // Huỷ tất cả ghế đã đặt
        Object.entries(seatBooking[showtimeId]).forEach(([seatId, data]) => {
            if (data.socketId === socket.id && data.status === "process") {
                delete seatBooking[showtimeId][seatId];
                io.to(showtimeId).emit('seat-released', { seatId });
            }
        });
    })

    // Chuyển ghế đã giữ sang trạng thái đặt
    socket.on('confirm-hold' , ({ showtimeId }) => {
        if (!showtimeId) {
            socket.emit('error', { message: 'Phòng chiếu không tồn tại!' });
            return;
        }

        if (!seatHolds[showtimeId]) {
            socket.emit('error', { message: 'Không có ghế nào được giữ!' });
            return;
        }

        seatBooking[showtimeId] = seatBooking[showtimeId] || {};

        Object.entries(seatHolds[showtimeId]).forEach(([seatId, holderId]) => {
            if (holderId === socket.id) {
                seatBooking[showtimeId][seatId] = { socketId: socket.id, status: "process" };
                delete seatHolds[showtimeId][seatId];
            }
        });

        // io.to(showtimeId).emit('seats-booked', seatBooking[showtimeId]);
    })

    // Đặt ghế đã giữ
    socket.on('book-seat', ({ showtimeId }) => {
        if (!showtimeId) {
            socket.emit('error', { message: 'Phòng chiếu không tồn tại!' });
            return;
        }

        if (!seatBooking[showtimeId]) {
            socket.emit('error', { message: 'Không có ghế nào được giữ!' });
            return;
        }

        Object.entries(seatBooking[showtimeId]).forEach(([seatId, data]) => {
            if (data.socketId === socket.id) {
                data.status = "booked";
            }
        });

        // Gửi danh sách ghế đã đặt
        io.to(showtimeId).emit('seats-booked', seatBooking[showtimeId]);
    });

    socket.on('disconnect', () => {
        const showtimeId = socket.currentShowtime;
        if (!showtimeId || !seatHolds[showtimeId]) return;

        const releasedSeats = [];

        Object.entries(seatHolds[showtimeId]).forEach(([seatId, holderId]) => {
            if (holderId === socket.id) {
                delete seatHolds[showtimeId][seatId];
                releasedSeats.push(seatId);
            }
        });

        Object.entries(seatBooking[showtimeId]).forEach(([seatId, data]) => {
            if (data.socketId === socket.id && data.status === "process") {
                delete seatBooking[showtimeId][seatId];
                releasedSeats.push(seatId);
            }
        });


        // Gửi danh sách ghế được huỷ về client khác
        releasedSeats.forEach(seatId => {
            io.to(showtimeId).emit('seat-released', { seatId });
        });
    });
});