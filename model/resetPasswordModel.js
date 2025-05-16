const mongoose = require('mongoose');

const resetPasswordSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, 'Mã token không được để trống'],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Người dùng không được để trống'],
        unique: true,
    },
    expired: {
        type: Date,
        required: [true, 'Thời gian hết hạn không được để trống'],
    },
}, { timestamps: true});


const ResetPassword = mongoose.model('ResetPassword', resetPasswordSchema);

module.exports = ResetPassword;
