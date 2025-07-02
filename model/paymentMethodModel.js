const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["VnPay", "Momo", "Zalopay"],
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

paymentMethodSchema.on('init', async (model) => {
    const defaultpayment = [
        { type: 'VnPay' },
        { type: 'Momo' },
        { type: 'Zalopay' }
    ];

    for (const payment of defaultpayment) {
        await model.findOneAndUpdate(
            { type: payment.type },
            { $set: { type: payment.type } },
            { upsert: true, new: true }
        );
    }
});

const PaymentMethod = mongoose.model("PaymentMethod", paymentMethodSchema);
module.exports = PaymentMethod;
