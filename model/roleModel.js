const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên của vai trò không được để trống!'],
        unique: [true, "Tên vai trò này đã tồn tại!"],
    },
    displayName: {
        type: String,
        required: [true, 'Tên hiển thị không được để trống!'],
        unique: true,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
    permissions: {
        type: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Permission' } ],
        default: []
    }
}, { timestamps: true});


roleSchema.pre("save", async function (next) {
    const Role = mongoose.model("Role");

    // Nếu đây là document mới (tạo mới)
    if (this.isNew) {
        const count = await Role.countDocuments();

        // Nếu chưa có Level nào => gán isDefault = true
        if (count === 0) {
            this.isDefault = true;
        }
    }

    // Nếu bản ghi này đang được đặt isDefault = true
    if (this.isDefault) {
        await Role.updateMany(
            { _id: { $ne: this._id } },
            { $set: { isDefault: false } }
        );
    }

    next();
});

const Role = mongoose.model("Role", roleSchema);

module.exports = Role;