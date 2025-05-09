const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Không được để trống"],
    },
    type: {
      type: String,
      enum: ["Tiền mặt", "VnPay", "Momo"],
      required: [true, "Không được để trống"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const PaymentMethod = mongoose.model("PaymentMethod", paymentMethodSchema);
module.exports = PaymentMethod;
