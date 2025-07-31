const mongoose = require('mongoose');

const rewardsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên phần thưởng không được để trống!'],
        unique: true
    },
    type: {
        type: String,
        required: [true, 'Loại phần thưởng không được để trống!'],
        enum: ['voucher', 'point']
    },
    value: {
        type: Number,
        required: [function() {
            return this.type === 'point';
        }, "Giá trị điểm không được để trống!"],
        min: [0, 'Giá trị phần thưởng phải lớn hơn hoặc bằng 0']
    },
    voucherId: {
        type: moongose.Schema.Types.ObjectId,
        ref: "Voucher",
        required: [function() {
            return this.type === 'voucher';
        }, "ID voucher không được để trống!"],
        unique: true
    },
    probability: {
        type: Number,
        required: [true, 'Xác suất phần thưởng không được để trống!'],
        min: [0, 'Xác suất phải lớn hơn hoặc bằng 0'],
        max: [1, 'Xác suất phải nhỏ hơn hoặc bằng 1']
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Rewards = mongoose.model('Rewards', rewardsSchema);

module.exports = Rewards;