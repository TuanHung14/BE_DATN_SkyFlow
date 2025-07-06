const mongoose = require("mongoose");

const cinemaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    province: {
      type: {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
      required: true,
    },
    district: {
      type: {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
      required: true,
    },
    ward: {
      type: {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      required: false, // hoặc true nếu bắt buộc nhập
    },
    img: {
      type: [String], // Mảng các URL hình ảnh
      default: [],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ Index để tìm kiếm theo vị trí
cinemaSchema.index({ location: "2dsphere" });

const Cinema = mongoose.model("Cinema", cinemaSchema);

module.exports = Cinema;
