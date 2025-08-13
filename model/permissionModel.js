const mongoose = require("mongoose");

const Action = {
    Create: 'create',
    Read: 'read',
    Update: 'update',
    Delete: 'delete'
}
const Resource = {
    Setting: 'setting',
    Format: 'format',
    PaymentMethod: 'paymentMethod',
    Banner: 'banner',
    Role: 'role',
    Post: 'post',
    Voucher: 'voucher',
    Food: 'food',
    PriceRule: 'pricerule',
    Ticket: 'ticket',
    ShowTime: 'showtime',
    MovieEntites: 'movieEntities',
    Movie: 'movie',
    Seat: 'seat',
    Room: 'room',
    Cinema: 'cinema',
    User: 'user',
    Level: 'level',
    Rewards: 'rewards'
}
const permissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên của quyền không được để trống!'],
        unique: [true, "Tên quyền này đã tồn tại!"],
    },
    displayName: {
        type: String,
        required: [true, 'Tên hiển thị không được để trống!'],
        unique: [true, "Tên hiển thị quyền này đã tồn tại!"],
    },
    resource: {
        type: String,
    }
},{ timestamps: true})

permissionSchema.on('init',  async (model) => {
    const actionDisplay = {
        [Action.Create]: 'Thêm',
        [Action.Read]: 'Xem',
        [Action.Update]: 'Chỉnh Sửa',
        [Action.Delete]: 'Xóa'
    }

    const resourceDisplay = {
        [Resource.Setting]: 'Cài Đặt',
        [Resource.Format]: 'Kiểu',
        [Resource.PaymentMethod]: 'Phương Thức Thanh Toán',
        [Resource.Banner]: 'Banner',
        [Resource.Role]: 'Quyền Hạn',
        [Resource.Post]: 'Bài Viết',
        [Resource.Voucher]: 'Mã Khuyến Mãi',
        [Resource.Food]: 'Thức Ăn',
        [Resource.PriceRule]: 'Quản Lý Giá Vé',
        [Resource.Ticket]: 'Vé',
        [Resource.ShowTime]: 'Suất Chiếu',
        [Resource.MovieEntites]: 'Thực Thể Phim',
        [Resource.Movie]: 'Phim',
        [Resource.Seat]: 'Ghế',
        [Resource.Room]: 'Phòng',
        [Resource.Cinema]: 'Rạp Chiếu',
        [Resource.User]: 'Người Dùng',
        [Resource.Level]: 'Cấp độ',
        [Resource.Rewards]: 'Phần quà'
    }

    const permissionsToCreate = [];

    for (const [resourceKey, resourceValue] of Object.entries(Resource)) {
        for (const [actionKey, actionValue] of Object.entries(Action)) {
            const permissionName = `${actionValue}_${resourceValue}`;
            const displayName = `${actionDisplay[actionValue]} ${resourceDisplay[resourceValue]}`;

            permissionsToCreate.push({
                name: permissionName,
                displayName: displayName,
                resource: resourceValue
            });
        }
    }

    for (const permData of permissionsToCreate) {
        await model.findOneAndUpdate(
            { name: permData.name },
            permData,
            { upsert: true, new: true }
        );
    }
});

const Permission = mongoose.model("Permission", permissionSchema);

module.exports = {
    Permission,
    Action,
    Resource
};