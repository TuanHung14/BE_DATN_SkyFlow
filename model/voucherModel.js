const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    voucherCode: {
      type: String,
      required: [true, "Không được để trống"],
      unique: true,
      trim: true,
    },
    voucherName: {
      type: String,
      required: [true, "Không được để trống"],
      trim: true,
    },
    discountValue: {
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
    imageUrl: {
      type: String,
      required: [true, "Không được để trống"],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Voucher", voucherSchema);
