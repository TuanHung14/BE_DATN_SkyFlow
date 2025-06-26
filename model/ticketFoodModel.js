const mongoose = require('mongoose');

const ticketFoodSchema = new mongoose.Schema({
    ticketId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Ticket',
        required: [true, 'Ticket ID is required']
    },
    foodId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Food',
        required: [true, 'Food ID is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
    },
    priceAtPurchase: {
        type: Number,
        required: [true, 'Price at purchase is required']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TicketFood', ticketFoodSchema);