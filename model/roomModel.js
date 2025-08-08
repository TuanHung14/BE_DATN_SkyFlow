const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cinema",
      required: [true, "ID rạp chiếu phim là bắt buộc"],
      index: true,
    },
    roomName: {
      type: String,
      required: [true, "Tên phòng chiếu là bắt buộc"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^room (10|[1-9])$/.test(v);
        },
        message: (props) => `${props.value} không đúng định dạng`,
      },
    },
    capacity: {
      type: Number,
      required: [true, "Sức chứa là bắt buộc"],
      max: [100, "Sức chứa không được vượt quá 100 chổ ngồi"],
      default: 0,
    },
    formats: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Format",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inActive"],
      default: "active",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ cinemaId: 1, roomName: 1 }, { unique: true });

const Room = mongoose.model("Room", roomSchema);
module.exports = Room;
