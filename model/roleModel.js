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
    permission: {
        type: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Permission' } ],
        default: []
    }
}, { timestamps: true});

const Role = mongoose.model("Role", roleSchema);

module.exports = Role;