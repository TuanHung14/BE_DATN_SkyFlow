const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        seatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Seat',
            required: [true, 'Seat ID is required']
        },
        showtimeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Showtime',
            required: [true, 'Showtime ID is required']
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required']
        },
        status: {
            type: String,
            enum: ['holding', 'process', 'pending', 'success'],
            required: [true, 'Status is required']
        },
    },
    {
        timestamps: true,
    }
);

bookingSchema.index({ seatId: 1, showtimeId: 1 }, { unique: true });

const Booking = mongoose.model("booking", bookingSchema);
module.exports = Booking;
