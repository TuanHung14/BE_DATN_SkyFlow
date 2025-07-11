const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Không được để trống"],
    },
    type: {
      type: String,
      enum: ["food", "drinks", "combo"], // bạn có thể thay đổi giá trị enum tùy theo hệ thống
      required: [true, "Không được để trống"],
    },
    price: {
      type: Number,
      required: [true, "Không được để trống"],
    },
    imageUrl: String,
    description: String,
    inventoryCount: {
      type: Number,
      min: [0, "Số lượng tồn kho không thể âm"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Food", foodSchema);
