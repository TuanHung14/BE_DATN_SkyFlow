const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    systemInstruction: {
        type: String,
        required: true,
        trim: true
    },
    functionToCall: {
        type: String,
        enum: ['getUserInfo', 'getMovies', 'getBookings', 'none'],
        default: 'none'
    },
    template: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'testing'],
        default: 'active'
    },
}, {timestamps: true});

const Prompt = mongoose.model('Prompt', promptSchema);
module.exports = Prompt;