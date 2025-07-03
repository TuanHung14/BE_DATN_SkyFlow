const catchAsync = require("../utils/catchAsync");

const BookingRealTime = require("../model/bookingModel");
exports.handleSocketEvents = catchAsync(async (io, socket) => {
})
// exports.handleSocketEvents = catchAsync(async (io, socket) => {
//     //Tham gia phòng chiếu kèm theo xóa showtimeId cũ nếu có
//     socket.on('join-room', async (data) => {
//         const { showtimeId, userId } = data;
//         if (!showtimeId) {
//             socket.emit('error', { message: 'Phòng chiếu không tồn tại!' });
//             return;
//         }
//         if (!userId) {
//             socket.emit('error', { message: 'Vui lòng đăng nhập!' });
//             return;
//         }
//
//         if (socket.currentShowtime) {
//             socket.leave(socket.currentShowtime);
//         }
//
//         socket.join(showtimeId);
//         socket.currentShowtime = showtimeId;
//         socket.userId = userId;
//
//         const allBookings = await BookingRealTime.find({ showtimeId });
//         const holds = {};
//         const bookings = {};
//         allBookings.forEach(booking => {
//             const seatId = booking.seatId.toString();
//             if (booking.status === 'holding' || booking.status === 'process' || booking.status === 'pending') {
//                 holds[seatId] = booking.userId.toString();
//             } else if (booking.status === 'success') {
//                 bookings[seatId] = booking.userId.toString();
//             }
//         });
//         // Gửi các ghế đang giữ
//         socket.emit('seats-hold', {
//             holds,
//             bookings
//         });
//         //Gửi riêng cho mình những ghế đã giữ
//         const myHolds = Object.keys(holds).filter(seatId => holds[seatId] === userId);
//         socket.emit('seats-hold-me', {
//             holds: myHolds
//         });
//     });
//
//     // Chọn Và Giữ ghế
//     socket.on('hold-seat', async ({ showtimeId, seatId }) => {
//         const userId = socket.userId;
//
//         if (!showtimeId || !seatId || !userId) {
//             socket.emit('error', { message: 'Phòng chiếu hoặc ghế không tồn tại!' });
//             return;
//         }
//
//         const existing = await BookingRealTime.findOne({ seatId, showtimeId });
//
//         if (existing && existing.status === 'pending') {
//             if (existing.userId.toString() !== userId.toString()) {
//                 socket.emit('error', { message: 'Ghế đang được giữ bởi người khác!' });
//                 return;
//             }
//         }
//         await BookingRealTime.findOneAndUpdate(
//             { seatId, showtimeId },
//             {
//                 seatId,
//                 showtimeId,
//                 userId,
//                 status: 'holding',
//             },
//             { upsert: true, new: true }
//         );
//
//         socket.to(showtimeId).emit('seat-held', { seatId, userId });
//         socket.emit('seats-held-me', { seatId });
//     });
//
//     // Huỷ giữ ghế
//     socket.on('release-seat', async ({ showtimeId, seatId }) => {
//         const userId = socket.userId;
//         if (!showtimeId || !seatId) {
//             socket.emit('error', { message: 'Phòng chiếu hoặc ghế không tồn tại!' });
//             return;
//         }
//
//         const result = await BookingRealTime.findOneAndDelete({
//             seatId,
//             showtimeId,
//             userId,
//             status: 'holding'
//         });
//
//         // Chỉ được huỷ nếu là người giữ ghế đó
//         if (
//             result
//         ) {
//             io.to(showtimeId).emit('seat-released', { seatId });
//         }else{
//             socket.emit('error', { message: 'Bạn không có quyền huỷ giữ ghế này!' });
//         }
//     });
//
//     // Huỷ giữ tất cả ghế đã đặt
//     socket.on('release-booking-seats', async ({ showtimeId }) => {
//         const userId = socket.userId;
//         if (!showtimeId) {
//             socket.emit('error', { message: 'Phòng chiếu không tồn tại!' });
//             return;
//         }
//
//         const seatsToRelease = await BookingRealTime.find({
//             showtimeId,
//             userId,
//             status: 'process'
//         });
//
//         const releasedSeatIds = seatsToRelease.map(b => b.seatId.toString());
//
//         await BookingRealTime.deleteMany({
//             showtimeId,
//             userId,
//             status: 'process'
//         });
//
//         if (!seatsToRelease.length) {
//             socket.emit('error', { message: 'Không có ghế nào được giữ!' });
//             return;
//         }
//         // Huỷ tất cả ghế đã đặt
//         releasedSeatIds.forEach(seatId => {
//             io.to(showtimeId).emit('seat-released', { seatId });
//         });
//     })
//
//     // Chuyển ghế đã giữ sang trạng thái đặt
//     socket.on('confirm-hold' , async ({ showtimeId }) => {
//         const userId = socket.userId;
//         if (!showtimeId) {
//             socket.emit('error', { message: 'Phòng chiếu không tồn tại!' });
//             return;
//         }
//
//         await BookingRealTime.updateMany(
//             { showtimeId, userId, status: 'holding' },
//             { $set: { status: 'process' } }
//         );
//     })
//
//     // Đặt ghế đã giữ
//     socket.on('book-seat', async ({ showtimeId }) => {
//         const userId = socket.userId;
//         if (!showtimeId) {
//             socket.emit('error', { message: 'Phòng chiếu không tồn tại!' });
//             return;
//         }
//
//         await BookingRealTime.updateMany(
//             { showtimeId, userId, status: 'process' },
//             { $set: { status: 'pending' } }
//         );
//
//         const bookings = await BookingRealTime.find({ showtimeId, status: 'pending' });
//
//         // io.to(showtimeId).emit('seats-booked', bookings);
//     });
//
//     // Nhận kết quả thanh toán từ client
//     socket.on('payment-result', async ({ showtimeId, userId, status }) => {
//         if(status === 'fail'){
//
//             const releasedSeats = await BookingRealTime.find({
//                 showtimeId,
//                 userId,
//                 status: 'pending'
//             });
//             // Nếu thanh toán thất bại, xóa lun
//             await BookingRealTime.deleteMany({
//                 showtimeId,
//                 userId,
//                 status: 'pending'
//             });
//
//
//             releasedSeats.forEach(seat => {
//                 io.to(showtimeId).emit('seat-released', { seatId: seat.seatId });
//             });
//
//         }else{
//             // Nếu thanh toán thành công, cập nhật trạng thái ghế
//             await BookingRealTime.updateMany(
//                 { showtimeId, userId, status: 'pending' },
//                 { $set: { status: 'success' }, $unset: { expiresAt: "" } }
//             );
//             // Gửi lại tất cả ghế đã đặt
//             const bookedSeats = await BookingRealTime.find({ showtimeId, status: 'success' });
//             io.to(showtimeId).emit('seats-booked',  bookedSeats);
//         }
//     })
//
//     socket.on('disconnect', async () => {
//         const userId = socket.userId;
//         const showtimeId = socket.currentShowtime;
//
//
//         const releasedSeats = await BookingRealTime.find({
//             userId,
//             showtimeId,
//             status: { $in: ['holding', 'process'] }
//         });
//
//         await BookingRealTime.deleteMany({
//             userId,
//             showtimeId,
//             status: { $in: ['holding', 'process'] }
//         });
//
//
//         // Gửi danh sách ghế được huỷ về client khác
//         releasedSeats.forEach(seat => {
//             io.to(showtimeId).emit('seat-released', { seatId: seat.seatId });
//         });
//     });
// });

//function xử lý nếu thanh toán thành công
