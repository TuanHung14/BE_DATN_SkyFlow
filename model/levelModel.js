const mongoose = require("mongoose");

const levelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên cấp độ không được để trống!'],
        unique: true,
        trim: true
    },
    icon: {
        type: String,
        required: [true, 'Biểu tượng cấp độ không được để trống!'],
        trim: true
    },
    minXp: {
        type: Number,
        required: [true, 'Điểm kinh nghiệm tối thiểu không được để trống!'],
        min: [0, 'Điểm kinh nghiệm tối thiểu phải lớn hơn hoặc bằng 0'],
        default: null,
    },
    pointMultiplier: {
        type: Number,
        required: [true, 'Hệ số điểm không được để trống!'],
        min: [0, 'Hệ số điểm phải lớn hơn hoặc bằng 0'],
        default: 1
    },
    voucherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Voucher',
        validate: {
            validator: function (v) {
                if (this.minXp > 0 && !v) return false;
                if (this.minXp === 0 && v) return false;
                return true;
            },
            message: 'Voucher chỉ được có khi minXp > 0, và không được có nếu minXp = 0!'
        },
        unique: true
    },
    active: {
        type: Boolean,
        default: true
    },
    isDefault: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
});

levelSchema.pre("save", async function (next) {
    const Level = mongoose.model("Level");

    // Nếu đây là document mới (tạo mới)
    if (this.isNew) {
        const count = await Level.countDocuments();

        // Nếu chưa có Level nào => gán isDefault = true
        if (count === 0) {
            this.isDefault = true;
        }
    }

    // Nếu bản ghi này đang được đặt isDefault = true
    if (this.isDefault) {
        await Level.updateMany(
            { _id: { $ne: this._id } },
            { $set: { isDefault: false } }
        );
    }

    next();
});


const Level = mongoose.model('Level', levelSchema);

module.exports = Level;


// Thêm biến point tạm để lưu trữ điểm của người dùng