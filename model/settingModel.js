const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: "Công ty TNHH ABC",
    },
    address: {
      type: String,
      required: [true, "Không được để trống"],
      default: "123 Đường ABC, Quận 1, TP.HCM",
    },
    contactEmail: {
      type: String,
      required: [true, "Không được để trống"],
      default: "contact@abc.com",
    },
    phoneNumber: {
      type: String,
      required: [true, "Không được để trống"],
      default: "0123456789",
    },
    logoUrl: {
      type: String,
      required: [true, "Không được để trống"],
      default: "https://example.com/logo.png",
    },
    isDefault: {
      type: Boolean,
      default: true,
    },
    priceDefault: {
      vip: {
        "2d": { type: Number, default: 150000 },
        "3d": { type: Number, default: 180000 },
        imax: { type: Number, default: 200000 },
      },
      premium: {
        "2d": { type: Number, default: 170000 },
        "3d": { type: Number, default: 190000 },
        imax: { type: Number, default: 200000 },
      },
      standard: {
        "2d": { type: Number, default: 100000 },
        "3d": { type: Number, default: 120000 },
        imax: { type: Number, default: 150000 },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
