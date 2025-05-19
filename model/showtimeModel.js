const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: [true, 'Suất chiếu phải có phim'],
        index: true,
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: [true, 'Suất chiếu phải có phòng chiếu'],
        index: true,
    },
    formatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Format",
        required: [true, 'Suất chiếu phải có định dạng']
    },
    showDate: {
        type: Date,
        required: [true, 'Suất chiếu phải có ngày chiếu'],
        validate: {
            validator: function(value) {
                return value >= new Date();
            },
            message: 'Ngày chiếu không được trong quá khứ'
        }
    },
    startTime: {
        type: Date,
        required: [true, 'Suất chiếu phải có giờ bắt đầu'],
    },
    status: {
        type: String,
        enum: {
            values: ['Available', 'Occupied', 'Maintenance'],
            message: '{VALUE} không phải là trạng thái hợp lệ'
        },
        default: 'Available'
    }
}, {
    timestamps: true
});

showtimeSchema.index({ room_id: 1, showDate: 1, startTime: 1 }, { unique: true });

// Middleware kiểm tra trùng lịch chiếu
// showtimeSchema.pre('save', async function(next) {
//     if (!this.isModified('startTime') && !this.isModified('movie_id') && !this.isModified('room_id')) {
//         return next();
//     }
//
//     try {
//         // Lấy thông tin phim để biết thời lượng
//         const Movie = mongoose.model('Movie');
//         const movie = await Movie.findById(this.movie_id);
//         if (!movie) {
//             return next(new Error('Không tìm thấy thông tin phim'));
//         }
//
//         // Tính thời gian kết thúc
//         const endTime = new Date(this.startTime);
//         endTime.setMinutes(endTime.getMinutes() + movie.duration);
//
//         // Kiểm tra trùng lịch trong cùng phòng
//         const conflictShowtime = await this.constructor.findOne({
//             room_id: this.room_id,
//             _id: { $ne: this._id },
//             $or: [
//                 // Suất chiếu khác bắt đầu trong khoảng thời gian này
//                 {
//                     startTime: {
//                         $gte: this.startTime,
//                         $lt: endTime
//                     }
//                 },
//                 // Suất chiếu khác kết thúc trong khoảng thời gian này
//                 {
//                     $expr: {
//                         $let: {
//                             vars: {
//                                 endTime: {
//                                     $add: ['$startTime', { $multiply: [movie.duration, 60000] }]
//                                 }
//                             },
//                             in: {
//                                 $and: [
//                                     { $gte: ['$$endTime', this.startTime] },
//                                     { $lte: ['$startTime', endTime] }
//                                 ]
//                             }
//                         }
//                     }
//                 }
//             ]
//         });
//
//         if (conflictShowtime) {
//             return next(new Error('Đã có suất chiếu khác trong khoảng thời gian này'));
//         }
//
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

// Middleware tự động populate thông tin phim và phòng
// showtimeSchema.pre(/^find/, function(next) {
//     this.populate({
//         path: 'movie_id',
//         select: 'name duration poster_url'
//     })
//     .populate({
//         path: 'room_id',
//         select: 'room_name capacity'
//     });
//
//     next();
// });

// showtimeSchema.statics.getShowtimesByDate = function(date) {
//     const startOfDay = new Date(date);
//     startOfDay.setHours(0, 0, 0, 0);
//
//     const endOfDay = new Date(date);
//     endOfDay.setHours(23, 59, 59, 999);
//
//     return this.find({
//         showDate: {
//             $gte: startOfDay,
//             $lte: endOfDay
//         }
//     }).sort('startTime');
// };

// showtimeSchema.statics.getShowtimesByMovie = function(movieId) {
//     return this.find({
//         movie_id: movieId,
//         startTime: { $gte: new Date() }
//     }).sort('startTime');
// };
//
// showtimeSchema.statics.getShowtimesByRoom = function(roomId) {
//     return this.find({
//         room_id: roomId,
//         startTime: { $gte: new Date() }
//     }).sort('startTime');
// };
//
// showtimeSchema.methods.checkAvailability = async function() {
//     // kiểm tra số ghế còn trống
//     const Booking = mongoose.model('Booking');
//     const totalBookings = await Booking.countDocuments({
//         showtime_id: this._id,
//         status: { $in: ['Pending', 'Confirmed'] }
//     });
//
//     const room = await mongoose.model('Room').findById(this.room_id);
//     return {
//         available: room.capacity - totalBookings,
//         total: room.capacity
//     };
// };

const Showtime = mongoose.model('Showtime', showtimeSchema);
module.exports = Showtime;