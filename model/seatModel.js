const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
    room_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: [true, "ID phòng chiếu là bắt buộc"],
        index: true,
        validate: {
            validator: async function(value) {
                try {
                    const Room = mongoose.model("Room");
                    const room = await Room.findById(value);
                    return !!room;
                } catch (error) {
                    return false;
                }
            },
            message: "Phòng chiếu không tồn tại"
        }
    },
    seat_row: {
        type: String,
        required: [true, "Hàng ghế là bắt buộc"],
        uppercase: true,
        validate: {
            validator: function(v) {
                return /^[A-Z]$/.test(v);
            },
            message: props => `${props.value} không phải là ký hiệu hàng hợp lệ (phải là chữ cái in hoa A-Z)!`
        }
    },
    seat_number: {
        type: Number,
        required: [true, "Số ghế là bắt buộc"],
        min: [1, "Số ghế phải lớn hơn 0"],
        max: [150, "Số ghế không được vượt quá 150"],
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} không phải là số nguyên!'
        }
    },
    seat_type: {
        type: String,
        enum: {
            values: ['standard', 'vip', 'couple'],
            message: "{VALUE} không phải là loại ghế hợp lệ"
        },
        default: 'standard'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    },
    toObject: { virtuals: true }
});

seatSchema.index({ room_id: 1, seat_row: 1, seat_number: 1 }, { unique: true });

// seatSchema.statics.getSeatsByRoom = function(roomId) {
//     return this.find({ room_id: roomId })
//                .sort({ seat_row: 1, seat_number: 1 });
// };

// seatSchema.statics.getAvailableSeatsByRoom = function(roomId) {
//     return this.find({
//         room_id: roomId,
//         status: 'active'
//     }).sort({ seat_row: 1, seat_number: 1 });
// };

// đảm bảo số lượng ghế không vượt quá capacity của phòng
seatSchema.pre('save', async function(next) {
    if (this.isNew) {
        const Room = mongoose.model('Room');
        const room = await Room.findById(this.room_id);
        const currentSeats = await this.constructor.countDocuments({ room_id: this.room_id });
        
        if (currentSeats >= room.capacity) {
            next(new Error('Số lượng ghế đã đạt giới hạn của phòng'));
        }
    }
    next();
});

// kiểm tra trùng lặp ghế
seatSchema.pre('save', async function(next) {
    try {
        const existingSeat = await this.constructor.findOne({
            room_id: this.room_id,
            seat_row: this.seat_row,
            seat_number: this.seat_number,
            _id: { $ne: this._id }
        });

        if (existingSeat) {
            return next(new Error('Vị trí ghế này đã tồn tại trong phòng'));
        }
        next();
    } catch (error) {
        next(error);
    }
});

// xử lý trước khi cập nhật
seatSchema.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate();
    if (update.room_id) {
        return next(new Error('Không thể thay đổi phòng của ghế'));
    }
    next();
});


const Seat = mongoose.model('Seat', seatSchema);
module.exports = Seat;