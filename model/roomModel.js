const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    cinema_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cinema',
        required: [true, "ID rạp chiếu phim là bắt buộc"],
        validate: {
            validator: async function(value) {
                try {
                    const Cinema = mongoose.model("Cinema");
                    const cinema = await Cinema.findById(value);
                    return cinema !== null;
                } catch (error) {
                    return false;
                }
            },
            message: "Rạp chiếu phim không tồn tại"
        }
    },
    room_name: {
        type: String,
        required: [true, "Tên phòng chiếu là bắt buộc" ],
        trim: true,
        minLength: [2, "Tên phòng phải có ít nhất 2 ký tự"],
        maxLength: [50, "Tên phòng không được vượt quá 50 ký tự"],
        validate: {
            validator: function(v) {
                return /^[a-zA-Z0-9\sÀ-ỹ]+$/.test(v);
            },
            message: props => `${props.value} không phải là tên phòng hợp lệ!`
        }
    },
    capacity: {
        type: Number,
        required: [true, "Sức chứa là bắt buộc"],
        min: [10, "Sức chứa phải ít nhất 10 chổ ngồi"],
        max: [150, "Sức chứa không được vượt quá 150 chổ ngồi"]
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});


// Thêm các phương thức tiện ích
roomSchema.statics.getActiveRooms = function(cinemaId) {
    return this.find({ 
        cinema_id: cinemaId, 
        status: 'active' 
    });
};

roomSchema.methods.getAvailableSeats = async function() {
    const Seat = mongoose.model('Seat');
    return await Seat.find({
        room_id: this._id,
        status: 'active'
    }).sort({ seat_row: 1, seat_number: 1 });
};

roomSchema.pre('save', async function(next) {
    if (this.isModified('capacity')) {
        try {
            const Seat = mongoose.model('Seat');
            const seatCount = await Seat.countDocuments({ room_id: this._id });

            if (this.capacity < seatCount) {
                return next(new Error('Không thể giảm sức chứa xuống thấp hơn số ghế hiện có'));
            }
        } catch (error) {
            return next(error);
        }
    }
    next();
});

roomSchema.pre('remove', async function(next) {
    try {
        const Seat = mongoose.model('Seat');
        const hasSeats = await Seat.exists({ room_id: this._id });

        if (hasSeats) {
            return next(new Error('Không thể xóa phòng đang có ghế'));
        }
        next();
    } catch (error) {
        next(error);
    }
});

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;