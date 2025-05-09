const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    voucher_code: {
      type: String,
      required: [true, "Mã voucher là bắt buộc"],
      unique: true,
    },
    discount_type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discount_value: {
      type: Number,
      required: true,
    },
    min_order_value: {
      type: Number,
    },
    expiry_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "used"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

voucherSchema.methods.isValid = function () {
  return this.status === "active" && this.expiry_date > new Date();
};

const Voucher = mongoose.model("Voucher", voucherSchema);
module.exports = Voucher;
