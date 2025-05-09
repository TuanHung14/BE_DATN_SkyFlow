const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Không được để trống"],
    },
    type: {
      type: String,
      enum: ["Đồ uống", "Thức ăn", "Combo"], // bạn có thể thay đổi giá trị enum tùy theo hệ thống
      required: [true, "Không được để trống"],
    },
    price: {
      type: Number,
      required: [true, "Không được để trống"],
    },
    image_url: String,
    description: String,
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Food", foodSchema);
