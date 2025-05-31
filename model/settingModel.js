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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
