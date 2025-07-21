const mongoose = require('mongoose');
const Room = require("./roomModel");

const seatSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: [true, "ID phòng chiếu là bắt buộc"],
        index: true,
    },
    seatRow: {
        type: String,
        // required: [true, "Hàng ghế là bắt buộc"],
        uppercase: true,
        validate: {
            validator: function(v) {
                return /^[A-Z]$/.test(v);
            },
            message: props => `${props.value} không phải là ký hiệu hàng hợp lệ (phải là chữ cái in hoa A-Z)!`
        }
    },
    seatNumber: {
        type: Number,
        // required: [true, "Số ghế là bắt buộc"],
        min: [1, "Số ghế phải lớn hơn 0"],
        max: [150, "Số ghế không được vượt quá 150"],
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} không phải là số nguyên!'
        }
    },
    seatType: {
        type: String,
        enum: {
            values: ['normal', 'vip', 'couple'],
            message: "{VALUE} không phải là loại ghế hợp lệ"
        },
        default: 'normal'
    },
    coupleId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    coupleDisplayName: {
        type: String,
        default: null
    },
    hidden: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: { values: ['active', 'inactive']},
        default: 'active'
    }
}, {
    timestamps: true
});

seatSchema.index({ roomId: 1, seatRow: 1, seatNumber: 1 }, { unique: true });

// đảm bảo số lượng ghế không vượt quá capacity của phòng
seatSchema.pre('save', async function(next) {
    if (this.isNew) {
        const room = await Room.findById(this.roomId);
        const currentSeats = await this.constructor.countDocuments({ roomId: this.roomId });

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
            roomId: this.roomId,
            seatRow: this.seatRow,
            seatNumber: this.seatNumber,
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
    if (update.roomId) {
        return next(new Error('Không thể thay đổi phòng của ghế'));
    }
    next();
});

// Đồng bộ trạng thái ghế đôi
seatSchema.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate();
    if (update.status && this._conditions._id) {
        const seat = await this.model.findById(this._conditions._id);
        if (seat && seat.coupleId) {
            await this.model.updateMany(
                { coupleId: seat.coupleId },
                { status: update.status }
            );
        }
    }
    next();
});

const Seat = mongoose.model('Seat', seatSchema);
module.exports = Seat;