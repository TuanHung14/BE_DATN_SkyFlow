const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    voucher_code: {
      type: String,
      required: [true, "Không được để trống"],
      unique: true,
      trim: true,
    },
    voucher_name: {
      type: String,
      required: [true, "Không được để trống"],
      trim: true,
    },
    discount_value: {
      type: Number,
      required: [true, "Không được để trống"],
      min: 0,
    },
    points: {
      type: Number,
      required: [true, "Không được để trống"],
      min: 0,
    },
    description: {
      type: String,
      required: [true, "Không được để trống"],
      trim: true,
    },
    image_url: {
      type: String,
      required: [true, "Không được để trống"],
      trim: true,
    },
    is_active: {
      type: Boolean,
      required: [true, "Không được để trống"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Voucher", voucherSchema);
