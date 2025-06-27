const mongoose = require('mongoose');

const ticketSeatSchema = new mongoose.Schema({
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: [true, 'Ticket ID is required']
    },
    seatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat',
        required: [true, 'Seat ID is required']
    },
    priceAtBooking: {
        type: Number,
        required: [true, 'Price at booking is required'],
        min: [0, 'Price at booking must be non-negative']
    }
}, { timestamps: true });

module.exports = mongoose.model('TicketSeat', ticketSeatSchema);