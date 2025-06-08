const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: [true, 'Suất chiếu phải có phim'],
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: [true, 'Suất chiếu phải có phòng chiếu'],
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
    endTime: {
      type: Date,
      required: [true, 'Suất chiếu phải có thời gian kết thúc'],
    },
    status: {
        type: String,
        enum: {
            values: ['Available', 'Occupied', 'Maintenance'],
            message: '{VALUE} không phải là trạng thái hợp lệ'
        },
        default: 'Available'
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deleteAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

showtimeSchema.index({ roomId: 1, showDate: 1, startTime: 1 }, { unique: true });
const Showtime = mongoose.model('Showtime', showtimeSchema);
module.exports = Showtime;