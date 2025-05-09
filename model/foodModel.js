const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["drink", "snack", "combo"], // bạn có thể thay đổi giá trị enum tùy theo hệ thống
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image_url: String,
    description: String,
    status: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Food", foodSchema);
