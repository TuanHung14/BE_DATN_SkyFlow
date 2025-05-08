const mongoose = require('mongoose');

const cinemaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    province: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true});

const Cinema = mongoose.model('Cinema', cinemaSchema);

module.exports = Cinema;