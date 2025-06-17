const mongoose = require("mongoose");

const Action = {
    Create: 'create',
    Read: 'read',
    Update: 'update',
    Delete: 'delete'
}
const Resource = {
    User: 'user',
    Movie: 'movie',
    Room: 'room',
    Seat: 'seat',
    Setting: 'setting',
    MovieEntites: 'movieEntities'
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
        [Resource.User]: 'Người Dùng',
        [Resource.Seat]: 'Ghế',
        [Resource.Room]: 'Phòng',
        [Resource.Movie]: 'Phim',
        [Resource.Setting]: 'Cài Đặt',
        [Resource.MovieEntites]: 'Thực Thể Phim'
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