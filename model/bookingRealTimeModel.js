const mongoose = require("mongoose");

const bookingRealTimeSchema = new mongoose.Schema(
    {
        // seatId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Seat',
        //     required: [true, 'Seat ID is required']
        // },
        seatId: {
            type: String,
            required: [true, 'Seat ID is required']
        },
        // showtimeId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Showtime',
        //     required: [true, 'Showtime ID is required']
        // },
        showtimeId: {
            type: String,
            required: [true, 'Showtime ID is required']
        },
        // userId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'User',
        //     required: [true, 'User ID is required']
        // },
        userId: {
            type: String,
            required: [true, 'User ID is required']
        },
        status: {
            type: String,
            enum: ['holding' | 'process' | 'pending' | 'success'],
            required: [true, 'Status is required']
        },
    },
    {
        timestamps: true,
    }
);

const BookingRealTime = mongoose.model("bookingRealTime", bookingRealTimeSchema);
module.exports = BookingRealTime;
